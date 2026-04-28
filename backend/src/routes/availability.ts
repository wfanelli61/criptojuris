import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const slotSchema = z.object({
    dayOfWeek:    z.number().int().min(0).max(6).optional(),
    specificDate: z.string().optional(), // ISO date string
    startTime:    z.string().regex(/^\d{2}:\d{2}$/),
    endTime:      z.string().regex(/^\d{2}:\d{2}$/),
    isRecurring:  z.boolean().default(true),
});

// ── Rutas del abogado (requieren auth) ────────────────────────────────────────

router.use(authenticate);

// GET /availability — slots propios del abogado
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user;
    if (role !== 'ABOGADO') throw new AppError('Solo abogados', 403);

    const slots = await (prisma as any).availabilitySlot.findMany({
        where: { lawyerId: userId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    res.json({ slots });
}));

// POST /availability — crear slot
router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user;
    if (role !== 'ABOGADO') throw new AppError('Solo abogados', 403);

    const data = slotSchema.parse(req.body);

    if (data.isRecurring && data.dayOfWeek === undefined)
        throw new AppError('dayOfWeek requerido para slots recurrentes', 400);
    if (!data.isRecurring && !data.specificDate)
        throw new AppError('specificDate requerido para slots puntuales', 400);
    if (data.startTime >= data.endTime)
        throw new AppError('La hora de inicio debe ser menor a la hora de fin', 400);

    const slot = await (prisma as any).availabilitySlot.create({
        data: {
            lawyerId: userId,
            dayOfWeek: data.isRecurring ? data.dayOfWeek : null,
            specificDate: data.specificDate ? new Date(data.specificDate) : null,
            startTime: data.startTime,
            endTime: data.endTime,
            isRecurring: data.isRecurring,
        },
    });
    res.status(201).json({ slot });
}));

// DELETE /availability/:id
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user;
    if (role !== 'ABOGADO') throw new AppError('Solo abogados', 403);

    const slot = await (prisma as any).availabilitySlot.findUnique({
        where: { id: req.params.id },
    });
    if (!slot || slot.lawyerId !== userId) throw new AppError('Slot no encontrado', 404);

    await (prisma as any).availabilitySlot.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
}));

export default router;
