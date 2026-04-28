import { qs } from '../validators';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// GET /legal-norms — búsqueda pública (autenticado)
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const { q, type, legalArea, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { active: true };
    if (type) where.type = type;
    if (legalArea) where.legalArea = legalArea;
    if (q) {
        where.OR = [
            { title: { contains: String(q) } },
            { content: { contains: String(q) } },
            { source: { contains: String(q) } },
        ];
    }

    const [total, norms] = await Promise.all([
        prisma.legalNorm.count({ where }),
        prisma.legalNorm.findMany({
            where,
            select: { id: true, title: true, type: true, legalArea: true, source: true, publishedAt: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        }),
    ]);

    res.json({ norms, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

// GET /legal-norms/:id — detalle completo
router.get('/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const norm = await prisma.legalNorm.findUnique({ where: { id: req.params.id } });
    if (!norm || !norm.active) throw new AppError('Norma no encontrada', 404);
    res.json({ norm });
}));

// POST /legal-norms — solo admin
router.post('/', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { title, content, type, legalArea, source, publishedAt } = req.body;
    if (!title || !content || !type || !legalArea) throw new AppError('Título, contenido, tipo y área son requeridos', 400);

    const validTypes = ['LEY', 'JURISPRUDENCIA', 'SENTENCIA'];
    const validAreas = ['PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO', 'GENERAL'];
    if (!validTypes.includes(type)) throw new AppError('Tipo inválido', 400);
    if (!validAreas.includes(legalArea)) throw new AppError('Área inválida', 400);

    const norm = await prisma.legalNorm.create({
        data: { title, content, type, legalArea, source: source || null, publishedAt: publishedAt ? new Date(publishedAt) : null },
    });
    res.status(201).json({ norm });
}));

// PUT /legal-norms/:id — solo admin
router.put('/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { title, content, type, legalArea, source, publishedAt, active } = req.body;
    const norm = await prisma.legalNorm.update({
        where: { id: req.params.id },
        data: {
            ...(title && { title }),
            ...(content && { content }),
            ...(type && { type }),
            ...(legalArea && { legalArea }),
            ...(source !== undefined && { source }),
            ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
            ...(active !== undefined && { active }),
        },
    });
    res.json({ norm });
}));

// DELETE /legal-norms/:id — solo admin (soft delete)
router.delete('/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    await prisma.legalNorm.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ message: 'Norma desactivada' });
}));

export default router;
