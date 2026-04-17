import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// GET /lawyers/me/profile — get lawyer's own profile
router.get('/me/profile', authenticate, requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
            id: true, name: true, email: true,
            lawyerProfile: true,
        },
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const profile = user.lawyerProfile;
    res.json({
        lawyer: {
            ...user,
            lawyerProfile: profile ? {
                ...profile,
                specialties: typeof profile.specialties === 'string' ? JSON.parse(profile.specialties) : profile.specialties,
                languages: typeof profile.languages === 'string' ? JSON.parse(profile.languages) : profile.languages,
            } : null,
        },
    });
}));

// PUT /lawyers/me/profile — update lawyer's profile
router.put('/me/profile', authenticate, requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { bio, specialties, city, languages, ratePerHour, yearsExperience } = req.body;

    const profile = await prisma.lawyerProfile.findUnique({
        where: { userId: req.user!.userId },
    });

    if (!profile) throw new AppError('Perfil no encontrado', 404);

    const updated = await prisma.lawyerProfile.update({
        where: { userId: req.user!.userId },
        data: {
            bio: bio || profile.bio,
            specialties: specialties ? JSON.stringify(specialties) : profile.specialties,
            city: city || profile.city,
            languages: languages ? JSON.stringify(languages) : profile.languages,
            ratePerHour: ratePerHour !== undefined ? ratePerHour : profile.ratePerHour,
            yearsExperience: yearsExperience !== undefined ? yearsExperience : profile.yearsExperience,
        },
    });

    res.json({ message: 'Perfil actualizado exitosamente', profile: updated });
}));

// GET /lawyers/me/appointments — get lawyer's appointments
router.get('/me/appointments', authenticate, requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const appointments = await prisma.appointmentRequest.findMany({
        where: { lawyerId: req.user!.userId },
        include: {
            service: { select: { id: true, name: true } },
            client: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ appointments });
}));

// PUT /lawyers/me/appointments/:id/status — update appointment status
router.put('/me/appointments/:id/status', authenticate, requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!['CONFIRMADA', 'CANCELADA', 'FINALIZADA'].includes(status)) {
        throw new AppError('Estado inválido', 400);
    }

    const appointment = await prisma.appointmentRequest.findFirst({
        where: { id: req.params.id as string, lawyerId: req.user!.userId },
    });

    if (!appointment) {
        throw new AppError('Solicitud no encontrada', 404);
    }

    const updated = await prisma.appointmentRequest.update({
        where: { id: appointment.id },
        data: { status },
    });

    res.json({ appointment: updated, message: 'Estado actualizado' });
}));

export default router;
