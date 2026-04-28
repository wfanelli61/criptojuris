import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
router.use(authenticate);
const prisma = new PrismaClient();

const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: any) => fn(req, res).catch(next);

const createPaymentSchema = z.object({
    caseId:    z.string().min(1),
    amount:    z.number().positive('El monto debe ser mayor a 0'),
    currency:  z.enum(['USD', 'VES']).default('USD'),
    method:    z.enum(['PAGO_MOVIL', 'TRANSFERENCIA', 'ZELLE', 'EFECTIVO', 'DIVISA', 'OTRO']),
    reference: z.string().optional(),
    bank:      z.string().optional(),
    phone:     z.string().optional(),
    concept:   z.string().optional(),
});

// POST /payments — cliente registra un pago
router.post('/', requireRole('CLIENTE'), asyncHandler(async (req, res) => {
    const data = createPaymentSchema.parse(req.body);

    const legalCase = await prisma.legalCase.findUnique({ where: { id: data.caseId } });
    if (!legalCase) throw new AppError('Caso no encontrado', 404);
    if (legalCase.clientId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const payment = await (prisma as any).casePayment.create({
        data: { ...data, clientId: req.user!.userId },
        include: { client: { select: { id: true, name: true } } },
    });

    // Log del evento
    await (prisma as any).caseEvent.create({ data: {
        caseId: data.caseId,
        userId: req.user!.userId,
        type: 'PAYMENT',
        description: `Pago registrado: ${data.currency} ${data.amount.toFixed(2)} vía ${data.method}${data.reference ? ` (Ref: ${data.reference})` : ''}`,
    }});

    res.status(201).json({ payment });
}));

// GET /payments/case/:caseId — ver pagos de un caso
router.get('/case/:caseId', asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    const { role, userId } = req.user!;

    const legalCase = await prisma.legalCase.findUnique({ where: { id: caseId } });
    if (!legalCase) throw new AppError('Caso no encontrado', 404);
    if (role === 'CLIENTE' && legalCase.clientId !== userId) throw new AppError('Sin acceso', 403);
    if (role === 'ABOGADO' && legalCase.lawyerId !== userId) throw new AppError('Sin acceso', 403);

    const payments = await (prisma as any).casePayment.findMany({
        where: { caseId },
        include: {
            client:      { select: { id: true, name: true, cedula: true } },
            confirmedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
}));

// PATCH /payments/:id/confirm — abogado confirma un pago
router.patch('/:id/confirm', requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req, res) => {
    const payment = await (prisma as any).casePayment.findUnique({
        where: { id: req.params.id },
        include: { case: true },
    });
    if (!payment) throw new AppError('Pago no encontrado', 404);
    if (req.user!.role === 'ABOGADO' && payment.case.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const updated = await (prisma as any).casePayment.update({
        where: { id: req.params.id },
        data: {
            status:         'CONFIRMADO',
            confirmedById:  req.user!.userId,
            confirmedAt:    new Date(),
            rejectedReason: null,
        },
    });

    await (prisma as any).caseEvent.create({ data: {
        caseId: payment.caseId,
        userId: req.user!.userId,
        type:   'PAYMENT',
        description: `Pago confirmado: ${payment.currency} ${Number(payment.amount).toFixed(2)} vía ${payment.method}`,
    }});

    res.json({ payment: updated });
}));

// PATCH /payments/:id/reject — abogado rechaza un pago
router.patch('/:id/reject', requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const payment = await (prisma as any).casePayment.findUnique({
        where: { id: req.params.id },
        include: { case: true },
    });
    if (!payment) throw new AppError('Pago no encontrado', 404);
    if (req.user!.role === 'ABOGADO' && payment.case.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const updated = await (prisma as any).casePayment.update({
        where: { id: req.params.id },
        data: { status: 'RECHAZADO', rejectedReason: reason || 'Sin motivo especificado' },
    });

    await (prisma as any).caseEvent.create({ data: {
        caseId: payment.caseId,
        userId: req.user!.userId,
        type:   'PAYMENT',
        description: `Pago rechazado: ${reason || 'Sin motivo'}`,
    }});

    res.json({ payment: updated });
}));

// GET /payments/case/:caseId/events — historial de eventos del caso
router.get('/case/:caseId/events', asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    const { role, userId } = req.user!;

    const legalCase = await prisma.legalCase.findUnique({ where: { id: caseId } });
    if (!legalCase) throw new AppError('Caso no encontrado', 404);
    if (role === 'CLIENTE' && legalCase.clientId !== userId) throw new AppError('Sin acceso', 403);
    if (role === 'ABOGADO' && legalCase.lawyerId !== userId) throw new AppError('Sin acceso', 403);

    const events = await (prisma as any).caseEvent.findMany({
        where: { caseId },
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
    });

    res.json({ events });
}));

export default router;
