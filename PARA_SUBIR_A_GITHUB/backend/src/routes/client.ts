import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { updateProfileSchema, createAppointmentSchema, paginationSchema } from '../validators';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);
router.use(requireRole('CLIENTE'));

// GET /clients/me
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    res.json({ user });
}));

// PUT /clients/me
router.put('/me', asyncHandler(async (req: Request, res: Response) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data,
        select: { id: true, email: true, name: true, phone: true, role: true },
    });
    res.json({ user });
}));

// GET /clients/me/appointments
router.get('/me/appointments', asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);

    const [total, appointments] = await Promise.all([
        prisma.appointmentRequest.count({ where: { clientId: req.user!.userId } }),
        prisma.appointmentRequest.findMany({
            where: { clientId: req.user!.userId },
            include: {
                service: { select: { id: true, name: true } },
                lawyer: { select: { id: true, name: true, lawyerProfile: { select: { specialties: true, photoUrl: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    // Parse JSON arrays from SQLite
    const parsed = appointments.map((a: any) => ({
        ...a,
        lawyer: a.lawyer ? {
            ...a.lawyer,
            lawyerProfile: a.lawyer.lawyerProfile ? {
                ...a.lawyer.lawyerProfile,
                specialties: typeof a.lawyer.lawyerProfile.specialties === 'string'
                    ? JSON.parse(a.lawyer.lawyerProfile.specialties) : a.lawyer.lawyerProfile.specialties,
            } : null,
        } : null,
    }));

    res.json({
        appointments: parsed,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}));

// POST /clients/me/appointments
router.post('/me/appointments', asyncHandler(async (req: Request, res: Response) => {
    console.log("=== APPOINTMENT REQUEST ===");
    console.log("USER:", req.user);
    const data = createAppointmentSchema.parse(req.body);

    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service || !service.active) {
        throw new AppError('Servicio no encontrado o inactivo', 404);
    }

    if (data.lawyerId) {
        const lawyer = await prisma.user.findFirst({
            where: { id: data.lawyerId, role: 'ABOGADO', deletedAt: null },
        });
        if (!lawyer) {
            throw new AppError('Abogado no encontrado', 404);
        }
    }

    const appointment = await prisma.appointmentRequest.create({
        data: {
            clientId: req.user!.userId,
            lawyerId: data.lawyerId || null,
            serviceId: data.serviceId,
            message: data.message,
            preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        },
        include: {
            service: { select: { id: true, name: true } },
            lawyer: { select: { id: true, name: true } },
        },
    });

    res.status(201).json({ appointment });
}));

// PUT /clients/me/appointments/:id/cancel
router.put('/me/appointments/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
    const appointment = await prisma.appointmentRequest.findFirst({
        where: { id: req.params.id as string, clientId: req.user!.userId },
    });

    if (!appointment) {
        throw new AppError('Solicitud no encontrada', 404);
    }

    if (!['PENDIENTE', 'CONFIRMADA'].includes(appointment.status)) {
        throw new AppError('No se puede cancelar una solicitud en este estado', 400);
    }

    const updated = await prisma.appointmentRequest.update({
        where: { id: req.params.id as string },
        data: { status: 'CANCELADA' },
    });

    res.json({ appointment: updated });
}));

export default router;
