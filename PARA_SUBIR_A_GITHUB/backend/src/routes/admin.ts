import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import {
    adminCreateUserSchema,
    serviceSchema,
    testimonialSchema,
    updateLawyerProfileSchema,
    paginationSchema,
} from '../validators';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Helper to parse JSON arrays
function parseLawyerProfile(profile: any) {
    if (!profile) return profile;
    return {
        ...profile,
        specialties: typeof profile.specialties === 'string' ? JSON.parse(profile.specialties) : profile.specialties,
        languages: typeof profile.languages === 'string' ? JSON.parse(profile.languages) : profile.languages,
    };
}

router.use(authenticate);
router.use(requireRole('ADMIN'));

// ========== USERS ==========

router.get('/users', asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const { role, search } = req.query;

    const where: any = { deletedAt: null };
    if (role) where.role = role;
    if (search) {
        where.OR = [
            { name: { contains: search as string } },
            { email: { contains: search as string } },
        ];
    }

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

router.post('/users', asyncHandler(async (req: Request, res: Response) => {
    const data = adminCreateUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('El email ya está registrado', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            name: data.name,
            phone: data.phone,
            role: data.role as any,
            emailVerified: true,
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (data.role === 'ABOGADO') {
        await prisma.lawyerProfile.create({
            data: { userId: user.id, specialties: '[]', languages: '[]' },
        });
    }

    res.status(201).json({ user });
}));

router.put('/users/:id/role', asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body;
    if (!['CLIENTE', 'ABOGADO', 'ADMIN'].includes(role)) {
        throw new AppError('Rol inválido', 400);
    }

    const user = await prisma.user.update({
        where: { id: req.params.id as string },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
    });

    if (role === 'ABOGADO') {
        await prisma.lawyerProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, specialties: '[]', languages: '[]' },
        });
    }

    res.json({ user });
}));

router.delete('/users/:id', asyncHandler(async (req: Request, res: Response) => {
    if (req.params.id as string === req.user!.userId) {
        throw new AppError('No puedes eliminarte a ti mismo', 400);
    }

    await prisma.user.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
}));

// ========== LAWYERS ==========

router.get('/lawyers', asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);

    const [total, lawyers] = await Promise.all([
        prisma.user.count({ where: { role: 'ABOGADO', deletedAt: null } }),
        prisma.user.findMany({
            where: { role: 'ABOGADO', deletedAt: null },
            select: {
                id: true, name: true, email: true,
                lawyerProfile: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    const parsed = lawyers.map(l => ({
        ...l,
        lawyerProfile: parseLawyerProfile(l.lawyerProfile),
    }));

    res.json({ lawyers: parsed, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

router.put('/lawyers/:id', asyncHandler(async (req: Request, res: Response) => {
    const data = updateLawyerProfileSchema.parse(req.body);

    const updateData: any = { ...data };
    if (data.specialties) updateData.specialties = JSON.stringify(data.specialties);
    if (data.languages) updateData.languages = JSON.stringify(data.languages);

    const profile = await prisma.lawyerProfile.upsert({
        where: { userId: req.params.id as string },
        update: updateData,
        create: { userId: req.params.id as string, ...updateData, specialties: updateData.specialties || '[]', languages: updateData.languages || '[]' },
    });

    res.json({ profile: parseLawyerProfile(profile) });
}));

router.put('/lawyers/:id/approve', asyncHandler(async (req: Request, res: Response) => {
    const profile = await prisma.lawyerProfile.update({
        where: { userId: req.params.id as string },
        data: { verificationStatus: 'APPROVED' },
    });
    res.json({ message: 'Abogado aprobado exitosamente', profile: parseLawyerProfile(profile) });
}));

router.put('/lawyers/:id/reject', asyncHandler(async (req: Request, res: Response) => {
    const profile = await prisma.lawyerProfile.update({
        where: { userId: req.params.id as string },
        data: { verificationStatus: 'REJECTED' },
    });
    res.json({ message: 'Verificación rechazada', profile: parseLawyerProfile(profile) });
}));

// ========== SERVICES ==========

router.get('/services', asyncHandler(async (_req: Request, res: Response) => {
    const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ services });
}));

router.post('/services', asyncHandler(async (req: Request, res: Response) => {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({ data: data as any });
    res.status(201).json({ service });
}));

router.put('/services/:id', asyncHandler(async (req: Request, res: Response) => {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.update({
        where: { id: req.params.id as string },
        data: data as any,
    });
    res.json({ service });
}));

router.delete('/services/:id', asyncHandler(async (req: Request, res: Response) => {
    await prisma.service.update({
        where: { id: req.params.id as string },
        data: { active: false },
    });
    res.json({ message: 'Servicio desactivado exitosamente' });
}));

// ========== TESTIMONIALS ==========

router.get('/testimonials', asyncHandler(async (_req: Request, res: Response) => {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ testimonials });
}));

router.post('/testimonials', asyncHandler(async (req: Request, res: Response) => {
    const data = testimonialSchema.parse(req.body);
    const testimonial = await prisma.testimonial.create({ data: data as any });
    res.status(201).json({ testimonial });
}));

router.put('/testimonials/:id', asyncHandler(async (req: Request, res: Response) => {
    const data = testimonialSchema.parse(req.body);
    const testimonial = await prisma.testimonial.update({
        where: { id: req.params.id as string },
        data: data as any,
    });
    res.json({ testimonial });
}));

router.put('/testimonials/:id/approve', asyncHandler(async (req: Request, res: Response) => {
    const testimonial = await prisma.testimonial.update({
        where: { id: req.params.id as string },
        data: { active: true },
    });
    res.json({ testimonial });
}));

router.delete('/testimonials/:id', asyncHandler(async (req: Request, res: Response) => {
    await prisma.testimonial.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Testimonio eliminado exitosamente' });
}));

// ========== APPOINTMENTS ==========

router.get('/appointments', asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const [total, appointments] = await Promise.all([
        prisma.appointmentRequest.count({ where }),
        prisma.appointmentRequest.findMany({
            where,
            include: {
                client: { select: { id: true, name: true, email: true } },
                lawyer: { select: { id: true, name: true, email: true } },
                service: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    res.json({ appointments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

router.put('/appointments/:id', asyncHandler(async (req: Request, res: Response) => {
    const { status, lawyerId } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (lawyerId !== undefined) updateData.lawyerId = lawyerId;

    const appointment = await prisma.appointmentRequest.update({
        where: { id: req.params.id as string },
        data: updateData,
        include: {
            client: { select: { id: true, name: true } },
            lawyer: { select: { id: true, name: true } },
            service: { select: { id: true, name: true } },
        },
    });

    res.json({ appointment });
}));

// GET /admin/metrics
router.get('/metrics', asyncHandler(async (_req: Request, res: Response) => {
    const [totalUsers, totalLawyers, totalClients, totalAppointments, pendingAppointments, totalServices, totalTestimonials] =
        await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.user.count({ where: { role: 'ABOGADO', deletedAt: null } }),
            prisma.user.count({ where: { role: 'CLIENTE', deletedAt: null } }),
            prisma.appointmentRequest.count(),
            prisma.appointmentRequest.count({ where: { status: 'PENDIENTE' } }),
            prisma.service.count({ where: { active: true } }),
            prisma.testimonial.count({ where: { active: true } }),
        ]);

    res.json({
        metrics: {
            totalUsers,
            totalLawyers,
            totalClients,
            totalAppointments,
            pendingAppointments,
            totalServices,
            totalTestimonials,
        },
    });
}));

// ========== VERIFICATIONS ==========

function parseVerification(v: any) {
    if (!v) return v;
    return {
        ...v,
        specialties: typeof v.specialties === 'string' ? JSON.parse(v.specialties) : v.specialties,
        references: typeof v.references === 'string' ? JSON.parse(v.references) : v.references,
        languages: typeof v.languages === 'string' ? JSON.parse(v.languages) : v.languages,
    };
}

router.get('/verifications', asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const statusFilter = req.query.status as string | undefined;

    const where: any = {};
    if (statusFilter) {
        where.verificationStatus = statusFilter;
    } else {
        where.verificationStatus = { in: ['PENDING', 'APPROVED', 'REJECTED'] };
    }

    const [total, profiles] = await Promise.all([
        prisma.lawyerProfile.count({ where }),
        prisma.lawyerProfile.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                verification: true,
            },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    res.json({
        verifications: profiles.map(p => ({
            ...p,
            verification: parseVerification(p.verification),
            specialties: typeof p.specialties === 'string' ? JSON.parse(p.specialties) : p.specialties,
            languages: typeof p.languages === 'string' ? JSON.parse(p.languages) : p.languages,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}));

router.get('/verifications/:profileId', asyncHandler(async (req: Request, res: Response) => {
    const profile = await prisma.lawyerProfile.findUnique({
        where: { id: req.params.profileId as string },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            verification: true,
        },
    });
    if (!profile) throw new AppError('Perfil no encontrado', 404);

    res.json({
        profile: {
            ...profile,
            verification: parseVerification(profile.verification),
            specialties: typeof profile.specialties === 'string' ? JSON.parse(profile.specialties) : profile.specialties,
            languages: typeof profile.languages === 'string' ? JSON.parse(profile.languages) : profile.languages,
        },
    });
}));

router.put('/verifications/:profileId/approve', asyncHandler(async (req: Request, res: Response) => {
    await prisma.lawyerProfile.update({
        where: { id: req.params.profileId as string },
        data: { verificationStatus: 'APPROVED' },
    });
    res.json({ message: 'Abogado aprobado exitosamente' });
}));

router.put('/verifications/:profileId/reject', asyncHandler(async (req: Request, res: Response) => {
    await prisma.lawyerProfile.update({
        where: { id: req.params.profileId as string },
        data: { verificationStatus: 'REJECTED' },
    });
    res.json({ message: 'Verificación rechazada' });
}));

export default router;
