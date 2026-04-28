import { qs } from '../validators';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// GET /notifications — obtener notificaciones del usuario (últimas 30)
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
    });
    const unread = notifications.filter(n => !n.read).length;
    res.json({ notifications, unread });
}));

// PATCH /notifications/:id/read — marcar una como leída
router.patch('/:id/read', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
        where: { id: req.params.id, userId },
        data: { read: true },
    });
    res.json({ ok: true });
}));

// PATCH /notifications/read-all — marcar todas como leídas
router.patch('/read-all', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });
    res.json({ ok: true });
}));

export default router;
