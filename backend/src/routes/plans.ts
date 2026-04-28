import { qs } from '../validators';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ─── PLANES ──────────────────────────────────────────────────────────────────

// GET /plans — lista de planes activos (público para mostrar en landing)
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    const plans = await prisma.plan.findMany({
        where: { active: true },
        orderBy: { price: 'asc' },
    });
    res.json({ plans });
}));

// GET /plans/all — todos los planes (admin)
router.get('/all', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
    res.json({ plans });
}));

// POST /plans — crear plan (admin)
router.post('/', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, currency, interval, maxCases, maxClients, features } = req.body;
    if (!name || price === undefined) throw new AppError('Nombre y precio son requeridos', 400);

    const plan = await prisma.plan.create({
        data: {
            name,
            description: description || null,
            price: Number(price),
            currency: currency || 'USD',
            interval: interval || 'MENSUAL',
            maxCases: Number(maxCases) || 5,
            maxClients: Number(maxClients) || 20,
            features: JSON.stringify(features || []),
        },
    });
    res.status(201).json({ plan });
}));

// PUT /plans/:id — editar plan (admin)
router.put('/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, currency, interval, maxCases, maxClients, features, active } = req.body;
    const plan = await prisma.plan.update({
        where: { id: req.params.id },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price: Number(price) }),
            ...(currency !== undefined && { currency }),
            ...(interval !== undefined && { interval }),
            ...(maxCases !== undefined && { maxCases: Number(maxCases) }),
            ...(maxClients !== undefined && { maxClients: Number(maxClients) }),
            ...(features !== undefined && { features: JSON.stringify(features) }),
            ...(active !== undefined && { active }),
        },
    });
    res.json({ plan });
}));

// DELETE /plans/:id — desactivar plan (admin)
router.delete('/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    await prisma.plan.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ message: 'Plan desactivado' });
}));

// ─── SUSCRIPCIONES ────────────────────────────────────────────────────────────

// GET /plans/subscriptions/me — suscripción del usuario autenticado
router.get('/subscriptions/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const sub = await prisma.subscription.findUnique({
        where: { userId: (req as any).user.id },
        include: { plan: true },
    });
    res.json({ subscription: sub });
}));

// POST /plans/subscribe — suscribir a un plan
router.post('/subscribe', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const { planId, paymentRef } = req.body;
    if (!planId) throw new AppError('planId es requerido', 400);

    const plan = await prisma.plan.findFirst({ where: { id: planId, active: true } });
    if (!plan) throw new AppError('Plan no encontrado', 404);

    const userId = (req as any).user.id;

    const endDate = new Date();
    if (plan.interval === 'ANUAL') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const sub = await prisma.subscription.upsert({
        where: { userId },
        create: { userId, planId, status: 'ACTIVA', paymentRef: paymentRef || null, endDate },
        update: { planId, status: 'ACTIVA', paymentRef: paymentRef || null, startDate: new Date(), endDate },
        include: { plan: true },
    });
    res.json({ subscription: sub });
}));

// GET /plans/subscriptions — todas las suscripciones (admin)
router.get('/subscriptions', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const subs = await prisma.subscription.findMany({
        include: { user: { select: { id: true, name: true, email: true } }, plan: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ subscriptions: subs });
}));

// PATCH /plans/subscriptions/:id — actualizar estado (admin)
router.patch('/subscriptions/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const sub = await prisma.subscription.update({
        where: { id: req.params.id },
        data: { status },
        include: { plan: true },
    });
    res.json({ subscription: sub });
}));

export default router;
