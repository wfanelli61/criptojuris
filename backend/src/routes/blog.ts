import { qs } from '../validators';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

function toSlug(title: string): string {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// GET /blog — lista pública de artículos publicados
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const legalArea = qs(req.query.legalArea);
    const page = qs(req.query.page) || '1';
    const limit = qs(req.query.limit) || '12';
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { published: true };
    if (legalArea) where.legalArea = legalArea;

    const [total, posts] = await Promise.all([
        prisma.blogPost.count({ where }),
        prisma.blogPost.findMany({
            where,
            select: { id: true, title: true, slug: true, excerpt: true, legalArea: true, imageUrl: true, publishedAt: true, author: { select: { id: true, name: true } } },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: Number(limit),
        }),
    ]);

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

// GET /blog/:slug — artículo individual (público)
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
    const post = await prisma.blogPost.findUnique({
        where: { slug: req.params.slug },
        include: { author: { select: { id: true, name: true, lawyerProfile: { select: { photoUrl: true, specialties: true } } } } },
    });
    if (!post || !post.published) throw new AppError('Artículo no encontrado', 404);
    res.json({ post });
}));

// POST /blog — abogado o admin crea artículo
router.post('/', authenticate, requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { title, content, excerpt, legalArea, imageUrl, published } = req.body;
    if (!title || !content) throw new AppError('Título y contenido son requeridos', 400);

    let slug = toSlug(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.blogPost.create({
        data: {
            title, slug, content,
            excerpt: excerpt || null,
            legalArea: legalArea || 'GENERAL',
            imageUrl: imageUrl || null,
            authorId: req.user!.userId,
            published: published || false,
            publishedAt: published ? new Date() : null,
        },
        include: { author: { select: { id: true, name: true } } },
    });
    res.status(201).json({ post });
}));

// PUT /blog/:id — autor o admin edita
router.put('/:id', authenticate, requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Artículo no encontrado', 404);
    if (req.user!.role === 'ABOGADO' && found.authorId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const { title, content, excerpt, legalArea, imageUrl, published } = req.body;
    const post = await prisma.blogPost.update({
        where: { id: req.params.id },
        data: {
            ...(title && { title }),
            ...(content && { content }),
            ...(excerpt !== undefined && { excerpt }),
            ...(legalArea && { legalArea }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(published !== undefined && {
                published,
                publishedAt: published && !found.published ? new Date() : found.publishedAt,
            }),
        },
        include: { author: { select: { id: true, name: true } } },
    });
    res.json({ post });
}));

// DELETE /blog/:id
router.delete('/:id', authenticate, requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Artículo no encontrado', 404);
    if (req.user!.role === 'ABOGADO' && found.authorId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ message: 'Artículo eliminado' });
}));

// GET /blog/my/posts — artículos del abogado autenticado
router.get('/my/posts', authenticate, requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const posts = await prisma.blogPost.findMany({
        where: req.user!.role === 'ADMIN' ? {} : { authorId: req.user!.userId },
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ posts });
}));

export default router;
