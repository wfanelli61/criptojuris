import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import lawyerRoutes from './routes/lawyer';
import publicRoutes from './routes/public';
import clientRoutes from './routes/client';
import adminRoutes from './routes/admin';
import verificationRoutes from './routes/verification';
import chatRoutes from './routes/chat';
import casesRoutes from './routes/cases';
import legalNormsRoutes from './routes/legalNorms';
import blogRoutes from './routes/blog';
import supportRoutes from './routes/support';
import plansRoutes from './routes/plans';
import reportsRoutes from './routes/reports';
import notificationsRoutes from './routes/notifications';
import reviewsRoutes from './routes/reviews';
import availabilityRoutes from './routes/availability';
import aiRoutes from './routes/ai';
import paymentsRoutes from './routes/payments';
import { initSocket } from './socket';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);

// Inicializar Socket.io
initSocket(httpServer);

// Middlewares Globales
app.use(compression());

// Middlewares de Seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline necesario para Next.js inline styles
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: [
                "'self'",
                "https:",
                ...(config.nodeEnv !== 'production' ? ["http://localhost:4000", "ws://localhost:4000"] : []),
            ],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Rate limiter general
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.nodeEnv === 'production' ? 100 : 500,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res, _next, options) => {
        res.status(options.statusCode).json({ error: 'Demasiadas peticiones. Intenta más tarde.' });
    },
});

// Rate limiter estricto para autenticación (5 intentos / 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.nodeEnv === 'production' ? 5 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res, _next, _options) => {
        res.status(429).json({ error: 'Demasiados intentos de acceso. Espera 15 minutos.' });
    },
    skipSuccessfulRequests: true, // No penaliza logins exitosos
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter); // Aplicar limite solo a la API

app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos (uploads)
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/legal-norms', legalNormsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), socket: 'initialized' });
});

// Manejador de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const prismaSetup = new PrismaClient();
httpServer.listen(config.port, '0.0.0.0', async () => {
    console.log(`Servidor corriendo en http://localhost:${config.port}`);
    console.log(`Entorno: ${config.nodeEnv}`);

    // Crear admin si no existe
    try {
        const exists = await prismaSetup.user.findUnique({ where: { email: 'admin@bufete.com' } });
        if (!exists) {
            const hash = await bcrypt.hash('123456', 12);
            await prismaSetup.user.create({
                data: { email: 'admin@bufete.com', passwordHash: hash, name: 'Administrador', role: 'ADMIN', emailVerified: true },
            });
        }
    } catch (e) {
        console.error('Setup admin error:', e);
    } finally {
        await prismaSetup.$disconnect();
    }
});

export default app;
