import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import prisma from '../config/database';
import { registerSchema, loginSchema } from '../validators';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Wrapper to catch async errors in Express 4
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

function generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any,
    });
    const refreshToken = jwt.sign({ userId, role }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn as any,
    });
    return { accessToken, refreshToken };
}

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

// Send verification email
async function sendVerificationEmail(email: string, name: string, token: string) {
    // corsOrigin is an array, use the first one for the verification URL
    const frontendUrl = Array.isArray(config.corsOrigin) ? config.corsOrigin[0] : config.corsOrigin;
    const verifyUrl = `${frontendUrl}/verificar?token=${token}`;

    try {
        // Dynamically import nodemailer
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            family: 4, // Force IPv4 (Render free tier doesn't support IPv6)
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } as any);

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"BufeteLegal" <noreply@bufetelegal.com>',
            to: email,
            subject: '✅ Verifica tu cuenta - BufeteLegal',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
                    <h2 style="color: #0C2340;">¡Bienvenido a BufeteLegal, ${name}!</h2>
                    <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                    <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #F0B429, #C68A0A); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 1rem 0;">
                        Verificar mi cuenta
                    </a>
                    <p style="color: #666; font-size: 0.85rem; margin-top: 1.5rem;">Si no creaste esta cuenta, ignora este correo.</p>
                </div>
            `,
        });
        console.log(`📧 Email de verificación enviado a ${email}`);
    } catch (err) {
        console.error('⚠️ Error enviando email de verificación:', err);
        console.log(`🔗 Link de verificación manual: ${verifyUrl}`);
    }
}

// POST /auth/register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new AppError('El email ya está registrado', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: data.role,
            emailVerified: true, // Auto-verificado (verificación desactivada para pruebas)
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    // If ABOGADO, create empty LawyerProfile
    if (data.role === 'ABOGADO') {
        await prisma.lawyerProfile.create({
            data: {
                userId: user.id,
                specialties: '[]',
                languages: '[]',
            },
        });
    }

    // TODO: Re-activar envío de email de verificación cuando esté listo
    // sendVerificationEmail(data.email, data.name, verificationToken);

    res.status(201).json({
        message: 'Registro exitoso. Ya puedes iniciar sesión.',
        requiresVerification: false,
    });
}));

// GET /auth/verify/:token
router.get('/verify/:token', asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
        where: { verificationToken: token as string },
    });

    if (!user) {
        throw new AppError('Token de verificación inválido o ya utilizado', 400);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
        },
    });

    res.json({ message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.' });
}));

// POST /auth/login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || user.deletedAt) {
        throw new AppError('Credenciales inválidas', 401);
    }

    // TODO: Re-activar verificación de email cuando esté listo
    // if (!user.emailVerified) {
    //     throw new AppError('Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.', 403);
    // }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
        throw new AppError('Credenciales inválidas', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken,
    });
}));

// POST /auth/refresh
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        throw new AppError('No se proporcionó refresh token', 401);
    }

    try {
        const decoded = jwt.verify(token, config.jwt.refreshSecret) as { userId: string; role: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.deletedAt) {
            throw new AppError('Usuario no encontrado', 401);
        }

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        setTokenCookies(res, accessToken, refreshToken);

        res.json({ accessToken });
    } catch {
        throw new AppError('Refresh token inválido', 401);
    }
}));

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Sesión cerrada exitosamente' });
});

// GET /auth/me
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            createdAt: true,
            lawyerProfile: true,
        },
    });
    res.json({ user });
}));

export default router;
