import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';

export interface JwtPayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
                email: string;
                name: string;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ error: 'No se proporcionó token de autenticación' });
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, email: true, name: true, deletedAt: true },
        });

        if (!user || user.deletedAt) {
            res.status(401).json({ error: 'Usuario no encontrado o desactivado' });
            return;
        }

        req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
            name: user.name,
        };

        next();
    } catch (error) {
        console.error("JWT VERIFY ERROR:", error);
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            next();
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, email: true, name: true, deletedAt: true },
        });

        if (user && !user.deletedAt) {
            req.user = {
                userId: user.id,
                role: user.role,
                email: user.email,
                name: user.name,
            };
        }
        next();
    } catch {
        next();
    }
};
