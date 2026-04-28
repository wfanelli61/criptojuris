import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// GET /reports/summary — resumen general
router.get('/summary', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const [
        totalUsers, totalLawyers, totalClients,
        totalCases, activeCases, closedCases,
        totalBlog, totalNorms, totalTickets, openTickets,
        totalSubscriptions, activeSubscriptions,
    ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { role: 'ABOGADO', deletedAt: null } }),
        prisma.user.count({ where: { role: 'CLIENTE', deletedAt: null } }),
        prisma.legalCase.count(),
        prisma.legalCase.count({ where: { status: 'EN_CURSO' } }),
        prisma.legalCase.count({ where: { status: 'CERRADO' } }),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.legalNorm.count({ where: { active: true } }),
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: 'ABIERTO' } }),
        prisma.subscription.count(),
        prisma.subscription.count({ where: { status: 'ACTIVA' } }),
    ]);

    res.json({
        users: { total: totalUsers, lawyers: totalLawyers, clients: totalClients },
        cases: { total: totalCases, active: activeCases, closed: closedCases },
        content: { blogPosts: totalBlog, norms: totalNorms },
        support: { total: totalTickets, open: openTickets },
        subscriptions: { total: totalSubscriptions, active: activeSubscriptions },
    });
}));

// GET /reports/cases — desglose de casos
router.get('/cases', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const byArea = await prisma.legalCase.groupBy({
        by: ['legalArea'],
        _count: { id: true },
    });
    const byStatus = await prisma.legalCase.groupBy({
        by: ['status'],
        _count: { id: true },
    });

    // Casos por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentCases = await prisma.legalCase.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, status: true, legalArea: true },
        orderBy: { createdAt: 'asc' },
    });

    const byMonth: Record<string, number> = {};
    recentCases.forEach(c => {
        const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
        byMonth[key] = (byMonth[key] || 0) + 1;
    });

    res.json({
        byArea: byArea.map(a => ({ area: a.legalArea, count: a._count.id })),
        byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
        byMonth: Object.entries(byMonth).map(([month, count]) => ({ month, count })),
    });
}));

// GET /reports/lawyers — métricas por abogado
router.get('/lawyers', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const lawyers = await prisma.user.findMany({
        where: { role: 'ABOGADO', deletedAt: null },
        select: {
            id: true, name: true, email: true,
            lawyerCases: { select: { id: true, status: true, legalArea: true } },
            blogPosts: { select: { id: true, published: true } },
        },
    });

    const data = lawyers.map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        totalCases: l.lawyerCases.length,
        activeCases: l.lawyerCases.filter(c => c.status === 'EN_CURSO').length,
        closedCases: l.lawyerCases.filter(c => c.status === 'CERRADO').length,
        blogPosts: l.blogPosts.filter(p => p.published).length,
    }));

    res.json({ lawyers: data });
}));

// GET /reports/export/cases — CSV de casos
router.get('/export/cases', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const cases = await prisma.legalCase.findMany({
        include: {
            client: { select: { name: true, email: true } },
            lawyer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const header = 'Expediente,Título,Área,Estado,Cliente,Abogado,Fecha';
    const rows = cases.map(c =>
        [
            c.caseNumber,
            `"${c.title.replace(/"/g, '""')}"`,
            c.legalArea,
            c.status,
            `"${c.client.name}"`,
            c.lawyer ? `"${c.lawyer.name}"` : 'Sin asignar',
            c.createdAt.toISOString().split('T')[0],
        ].join(',')
    );

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="expedientes.csv"');
    res.send('\uFEFF' + csv); // BOM para Excel
}));

// GET /reports/export/lawyers — CSV de abogados
router.get('/export/lawyers', authenticate, requireRole('ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
    const lawyers = await prisma.user.findMany({
        where: { role: 'ABOGADO', deletedAt: null },
        select: {
            name: true, email: true,
            lawyerCases: { select: { status: true } },
            blogPosts: { select: { published: true } },
            subscription: { include: { plan: true } },
        },
    });

    const header = 'Nombre,Email,Total Casos,Casos Activos,Casos Cerrados,Artículos,Plan';
    const rows = lawyers.map(l =>
        [
            `"${l.name}"`,
            l.email,
            l.lawyerCases.length,
            l.lawyerCases.filter(c => c.status === 'EN_CURSO').length,
            l.lawyerCases.filter(c => c.status === 'CERRADO').length,
            l.blogPosts.filter(p => p.published).length,
            l.subscription?.plan?.name || 'Sin plan',
        ].join(',')
    );

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="abogados.csv"');
    res.send('\uFEFF' + csv);
}));

export default router;
