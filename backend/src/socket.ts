import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config';
import prisma from './config/database';

export const initSocket = (httpServer: HttpServer) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware de autenticación para Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as any;
            (socket as any).userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = (socket as any).userId;
        console.log(`Usuario conectado al socket: ${userId}`);

        socket.on('join_conversation', (conversationId: string) => {
            socket.join(conversationId);
            console.log(`Usuario ${userId} se unió a la sala: ${conversationId}`);
        });

        socket.on('send_message', async (data: { conversationId: string, content: string }) => {
            try {
                // Guardar mensaje en la base de datos
                const message = await prisma.message.create({
                    data: {
                        conversationId: data.conversationId,
                        senderId: userId,
                        content: data.content
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                });

                // Actualizar la conversación para que aparezca arriba en la lista
                await prisma.conversation.update({
                    where: { id: data.conversationId },
                    data: { updatedAt: new Date() }
                });

                // Emitir el mensaje a todos en la sala (incluyendo al remitente)
                io.to(data.conversationId).emit('new_message', message);

                // También podríamos emitir una notificación global si el usuario no está en la sala
                // pero por ahora mantengámoslo simple.
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
