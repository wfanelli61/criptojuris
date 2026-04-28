import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);

const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
});

// POST /reviews/:caseId — cliente deja calificación (solo si caso CERRADO y sin review previa)
router.post('/:caseId', asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user;
    if (role !== 'CLIENTE') throw new AppError('Solo los clientes pueden calificar', 403);

    const { rating, comment } = reviewSchema.parse(req.body);
    const caseId = req.params.caseId;

    const legalCase = await prisma.legalCase.findFirst({
        where: { id: caseId as string, clientId: userId as string, status: 'CERRADO' },
    }) as any;

    if (!legalCase) throw new AppError('Caso no encontrado o no está cerrado', 404);
    if (!legalCase.lawyerId) throw new AppError('El caso no tiene abogado asignado', 400);

    const existing = await (prisma as any).review.findUnique({ where: { caseId } });
    if (existing) throw new AppError('Ya calificaste este caso', 409);

    const review = await (prisma as any).review.create({
        data: { caseId, clientId: userId, lawyerId: legalCase.lawyerId, rating, comment },
    });

    res.status(201).json({ review });
}));

// GET /reviews/lawyer/:lawyerId — calificaciones de un abogado (autenticado)
router.get('/lawyer/:lawyerId', asyncHandler(async (req: Request, res: Response) => {
    const lawyerId = req.params.lawyerId;

    const reviews = await (prisma as any).review.findMany({
        where: { lawyerId },
        include: {
            client: { select: { name: true } },
            case: { select: { title: true, legalArea: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const avg = reviews.length
        ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
        : 0;

    res.json({
        reviews,
        stats: {
            total: reviews.length,
            average: Math.round(avg * 10) / 10,
            distribution: [5, 4, 3, 2, 1].map(n => ({
                stars: n,
                count: reviews.filter((r: any) => r.rating === n).length,
            })),
        },
    });
}));

// GET /reviews/case/:caseId — review de un caso específico
router.get('/case/:caseId', asyncHandler(async (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    const review = await (prisma as any).review.findUnique({
        where: { caseId },
        include: { client: { select: { name: true } } },
    });
    res.json({ review });
}));

export default router;
