import { qs } from '../validators';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';
import { notify } from '../utils/notify';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);

// POST /support — cualquier usuario crea ticket
router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { subject, message } = req.body;
    if (!subject || !message) throw new AppError('Asunto y mensaje son requeridos', 400);

    const ticket = await prisma.supportTicket.create({
        data: { userId: req.user!.userId, subject, message },
        include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Notificar a admins del nuevo ticket
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', deletedAt: null }, select: { id: true } });
    await Promise.all(admins.map(a => notify(a.id, {
        title: 'Nuevo ticket de soporte',
        body: `${ticket.user.name}: "${subject}"`,
        type: 'SOPORTE',
        link: '/dashboard/soporte',
    })));

    res.status(201).json({ ticket });
}));

// GET /support — usuario ve los suyos, admin ve todos
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const where: any = {};
    if (req.user!.role !== 'ADMIN') where.userId = req.user!.userId;
    if (status) where.status = status;

    const tickets = await prisma.supportTicket.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ tickets });
}));

// GET /support/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: req.params.id },
        include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!ticket) throw new AppError('Ticket no encontrado', 404);
    if (req.user!.role !== 'ADMIN' && ticket.userId !== req.user!.userId) throw new AppError('Sin acceso', 403);
    res.json({ ticket });
}));

// PATCH /support/:id/respond — solo admin responde
router.patch('/:id/respond', requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { response, status } = req.body;
    if (!response) throw new AppError('La respuesta es requerida', 400);

    const validStatuses = ['ABIERTO', 'EN_PROCESO', 'CERRADO'];
    const ticket = await prisma.supportTicket.update({
        where: { id: req.params.id },
        data: {
            response,
            status: status && validStatuses.includes(status) ? status : 'CERRADO',
        },
        include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Notificar al usuario que su ticket fue respondido
    await notify(ticket.userId, {
        title: 'Respuesta a tu ticket de soporte',
        body: `Tu consulta "${ticket.subject}" fue respondida.`,
        type: 'SOPORTE',
        link: '/dashboard/soporte',
    });

    res.json({ ticket });
}));

// DELETE /support/:id — usuario cancela su ticket abierto
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) throw new AppError('Ticket no encontrado', 404);
    if (req.user!.role !== 'ADMIN' && ticket.userId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    await prisma.supportTicket.delete({ where: { id: req.params.id } });
    res.json({ message: 'Ticket eliminado' });
}));

export default router;
