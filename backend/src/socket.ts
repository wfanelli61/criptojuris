import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config';
import prisma from './config/database';

// Exportado para que las rutas puedan emitir notificaciones
export let io: SocketServer;

export const initSocket = (httpServer: HttpServer) => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: config.corsOrigin,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as any;
            (socket as any).userId = decoded.userId;
            next();
        } catch {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = (socket as any).userId;

        // Cada usuario tiene su sala personal para recibir notificaciones
        socket.join(`user:${userId}`);
        console.log(`Usuario conectado al socket: ${userId}`);

        socket.on('join_conversation', (conversationId: string) => {
            socket.join(conversationId);
        });

        socket.on('send_message', async (data: { conversationId: string; content: string }) => {
            try {
                const message = await prisma.message.create({
                    data: { conversationId: data.conversationId, senderId: userId, content: data.content },
                    include: { sender: { select: { id: true, name: true } } },
                });

                await prisma.conversation.update({
                    where: { id: data.conversationId },
                    data: { updatedAt: new Date() },
                });

                io.to(data.conversationId).emit('new_message', message);
            } catch (err) {
                console.error('Error enviando mensaje por socket:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Usuario desconectado del socket: ${userId}`);
        });
    });

    return io;
};
