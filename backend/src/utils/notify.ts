import prisma from '../config/database';
import { io } from '../socket';

interface NotifyPayload {
    title: string;
    body?: string;
    type: 'CASO' | 'MENSAJE' | 'PRESUPUESTO' | 'CONTRATO' | 'SOPORTE' | 'SISTEMA';
    link?: string;
    refId?: string;
}

export async function notify(userId: string, payload: NotifyPayload) {
    try {
        const notif = await prisma.notification.create({
            data: { userId, ...payload },
        });
        if (io) io.to(`user:${userId}`).emit('notification', notif);
        return notif;
    } catch (err) {
        console.error('Error creando notificación:', err);
    }
}

// Elimina notificaciones por refId para usuarios específicos y las borra del frontend en tiempo real
export async function removeNotifications(refId: string, exceptUserId?: string) {
    try {
        const where: any = { refId, type: 'CASO' };
        if (exceptUserId) where.userId = { not: exceptUserId };

        const toDelete = await prisma.notification.findMany({ where, select: { id: true, userId: true } });

        await prisma.notification.deleteMany({ where });

        // Notificar en tiempo real a cada afectado para que la borre de su UI
        if (io) {
            const userIds = [...new Set(toDelete.map((n: { userId: string }) => n.userId))];
            userIds.forEach(uid => {
                io.to(`user:${uid}`).emit('notification_remove', { refId });
            });
        }
    } catch (err) {
        console.error('Error eliminando notificaciones:', err);
    }
}
