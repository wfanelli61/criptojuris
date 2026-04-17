import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { lawyerVerificationSchema } from '../validators';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

function parseVerification(v: any) {
    if (!v) return v;
    return {
        ...v,
        specialties: typeof v.specialties === 'string' ? JSON.parse(v.specialties) : v.specialties,
        references: typeof v.references === 'string' ? JSON.parse(v.references) : v.references,
        languages: typeof v.languages === 'string' ? JSON.parse(v.languages) : v.languages,
    };
}

// GET /verification/me — get current lawyer's verification status
router.get('/me', authenticate, requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const profile = await prisma.lawyerProfile.findUnique({
        where: { userId: req.user!.userId },
        include: { verification: true },
    });

    res.json({
        verificationStatus: profile?.verificationStatus || 'NONE',
        verification: parseVerification(profile?.verification),
    });
}));

// POST /verification/submit — submit verification form
router.post('/submit', authenticate, requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const data = lawyerVerificationSchema.parse(req.body);

    const profile = await prisma.lawyerProfile.findUnique({
        where: { userId: req.user!.userId },
    });

    if (!profile) throw new AppError('Perfil de abogado no encontrado', 404);

    // Upsert verification data
    await prisma.lawyerVerification.upsert({
        where: { lawyerProfileId: profile.id },
        update: {
            ...data,
            specialties: JSON.stringify(data.specialties),
            references: JSON.stringify(data.references),
            languages: JSON.stringify(data.languages),
        },
        create: {
            lawyerProfileId: profile.id,
            ...data,
            specialties: JSON.stringify(data.specialties),
            references: JSON.stringify(data.references),
            languages: JSON.stringify(data.languages),
        },
    });

    // Update status to PENDING
    await prisma.lawyerProfile.update({
        where: { id: profile.id },
        data: { verificationStatus: 'PENDING' },
    });

    res.json({ message: 'Solicitud enviada exitosamente. Un administrador la revisará pronto.' });
}));

export default router;
