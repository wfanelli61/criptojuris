import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { paginationSchema } from '../validators';

const router = Router();

// Helper to parse JSON array fields from SQLite
function parseLawyerProfile(profile: any) {
    if (!profile) return profile;
    return {
        ...profile,
        specialties: typeof profile.specialties === 'string' ? JSON.parse(profile.specialties) : profile.specialties,
        languages: typeof profile.languages === 'string' ? JSON.parse(profile.languages) : profile.languages,
    };
}

// GET /services
router.get('/services', async (_req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ services });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
});

// GET /testimonials
router.get('/testimonials', async (_req: Request, res: Response) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ testimonials });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener testimonios' });
    }
});

// GET /lawyers
router.get('/lawyers', async (req: Request, res: Response) => {
    try {
        const { page, limit } = paginationSchema.parse(req.query);
        const { specialty, city, search, minPrice, maxPrice } = req.query;

        const where: any = {
            role: 'ABOGADO',
            deletedAt: null,
            lawyerProfile: { 
                verificationStatus: 'APPROVED'
            },
        };

        if (city) {
            where.lawyerProfile = { ...where.lawyerProfile, city: { equals: city as string } };
        }
        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { lawyerProfile: { bio: { contains: search as string } } },
            ];
        }

        const [total, lawyers] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    lawyerProfile: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' },
            }),
        ]);

        // Parse JSON arrays and apply filters
        let filtered = lawyers.map(l => ({
            ...l,
            name: l.name || 'Abogado',
            lawyerProfile: l.lawyerProfile ? parseLawyerProfile(l.lawyerProfile) : null,
        })).filter(l => l.lawyerProfile !== null);

        // Specialty filter (done post-query since SQLite stores as JSON string)
        if (specialty) {
            filtered = filtered.filter((l) =>
                l.lawyerProfile?.specialties?.some((s: string) =>
                    s.toLowerCase().includes((specialty as string).toLowerCase())
                )
            );
        }

        // Price filter
        if (minPrice || maxPrice) {
            filtered = filtered.filter((l) => {
                const rate = l.lawyerProfile?.ratePerHour || 0;
                if (minPrice && rate < Number(minPrice)) return false;
                if (maxPrice && rate > Number(maxPrice)) return false;
                return true;
            });
        }

        res.json({
            lawyers: filtered,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener abogados' });
    }
});

// GET /lawyers/:id
router.get('/lawyers/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const lawyer = await prisma.user.findFirst({
            where: { id: id as string, role: 'ABOGADO', deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                lawyerProfile: true,
            },
        });

        if (!lawyer) {
            return res.status(404).json({ error: 'Abogado no encontrado' });
        }

        res.json({
            lawyer: {
                ...lawyer,
                lawyerProfile: parseLawyerProfile((lawyer as any).lawyerProfile),
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el perfil del abogado' });
    }
});

export default router;
