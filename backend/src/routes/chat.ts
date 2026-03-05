import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/chat');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Obtener todas las conversaciones del usuario
router.get('/conversations', authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: userId }
                }
            },
            include: {
                participants: {
                    where: {
                        NOT: { id: userId }
                    },
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        lawyerProfile: {
                            select: { photoUrl: true }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Error al obtener conversaciones' });
    }
});

// Obtener mensajes de una conversación
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        // Verificar que el usuario pertenece a la conversación
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: id as string,
                participants: {
                    some: { id: userId }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: id as string },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

// Iniciar o recuperar una conversación con otro usuario
router.post('/conversations', authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ error: 'Se requiere el ID del usuario destino' });
        }

        // Buscar si ya existe una conversación entre ambos
        // En SQLite/Prisma para 1-on-1 podemos buscar una conversación que tenga exactamente estos dos participantes
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: targetUserId } } }
                ]
            }
        });

        if (existingConversation) {
            return res.json(existingConversation);
        }

        // Crear nueva conversación
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: userId },
                        { id: targetUserId }
                    ]
                }
            }
        });

        res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error creating/finding conversation:', error);
        res.status(500).json({ error: 'Error al gestionar la conversación' });
    }
});

// Subir archivo a una conversación
router.post('/conversations/:id/upload', authenticate, upload.single('file'), async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        // Verificar que el usuario pertenece a la conversación
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: id as string,
                participants: {
                    some: { id: userId }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        // Crear mensaje con el archivo
        const newMessage = await prisma.message.create({
            data: {
                conversationId: id,
                senderId: userId,
                content: `Archivo adjunto: ${file.originalname}`,
                fileUrl: `/uploads/chat/${file.filename}`,
                fileName: file.originalname,
                fileSize: file.size,
                fileType: file.mimetype
            },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            }
        });

        // Actualizar timestamp de la conversación
        await prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error al subir el archivo' });
    }
});

export default router;
