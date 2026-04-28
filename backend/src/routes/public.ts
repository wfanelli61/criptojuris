import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { paginationSchema, qs } from '../validators';

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
        res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
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
        res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
        res.json({ testimonials });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener testimonios' });
    }
});

// GET /lawyers
router.get('/lawyers', async (req: Request, res: Response) => {
    try {
        const { page, limit } = paginationSchema.parse(req.query);
        const { specialty, city, search, minPrice, maxPrice, minYears, language, sortBy } = req.query;

        const where: any = {
            role: 'ABOGADO',
            deletedAt: null,
            lawyerProfile: { verificationStatus: 'APPROVED', active: true },
        };

        if (city) where.lawyerProfile = { ...where.lawyerProfile, city: { contains: city as string } };
        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { lawyerProfile: { bio: { contains: search as string } } },
            ];
        }

        // SQLite JSON fields require in-memory filtering — cap at 500 records to prevent OOM
        const lawyers = await prisma.user.findMany({
            where,
            select: {
                id: true, name: true, email: true, lawyerProfile: true,
                reviewsReceived: { select: { rating: true } },
            },
            orderBy: { name: 'asc' },
            take: 500,
        });

        let filtered = lawyers.map(l => {
            const ratings = (l as any).reviewsReceived || [];
            const avgRating = ratings.length
                ? Math.round((ratings.reduce((a: number, r: any) => a + r.rating, 0) / ratings.length) * 10) / 10
                : null;
            return {
                ...l,
                name: l.name || 'Abogado',
                lawyerProfile: l.lawyerProfile ? parseLawyerProfile(l.lawyerProfile) : null,
                reviewsReceived: undefined,
                avgRating,
                totalReviews: ratings.length,
            };
        }).filter(l => l.lawyerProfile !== null);

        // Specialty filter
        if (specialty) {
            filtered = filtered.filter(l =>
                l.lawyerProfile?.specialties?.some((s: string) =>
                    s.toLowerCase().includes((specialty as string).toLowerCase())
                )
            );
        }

        // Price filter
        if (minPrice || maxPrice) {
            filtered = filtered.filter(l => {
                const rate = l.lawyerProfile?.ratePerHour || 0;
                if (minPrice && rate < Number(minPrice)) return false;
                if (maxPrice && Number(maxPrice) > 0 && rate > Number(maxPrice)) return false;
                return true;
            });
        }

        // Years of experience filter
        if (minYears) {
            filtered = filtered.filter(l => (l.lawyerProfile?.yearsExperience || 0) >= Number(minYears));
        }

        // Language filter
        if (language) {
            filtered = filtered.filter(l =>
                l.lawyerProfile?.languages?.some((lang: string) =>
                    lang.toLowerCase().includes((language as string).toLowerCase())
                )
            );
        }

        // Sorting
        const sort = (sortBy as string) || 'name';
        filtered.sort((a, b) => {
            if (sort === 'price_asc') return (a.lawyerProfile?.ratePerHour || 0) - (b.lawyerProfile?.ratePerHour || 0);
            if (sort === 'price_desc') return (b.lawyerProfile?.ratePerHour || 0) - (a.lawyerProfile?.ratePerHour || 0);
            if (sort === 'experience') return (b.lawyerProfile?.yearsExperience || 0) - (a.lawyerProfile?.yearsExperience || 0);
            return a.name.localeCompare(b.name);
        });

        const total = filtered.length;
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        res.json({
            lawyers: paginated,
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
                reviewsReceived: { select: { rating: true } },
            },
        });

        if (!lawyer) {
            return res.status(404).json({ error: 'Abogado no encontrado' });
        }

        const ratings = (lawyer as any).reviewsReceived || [];
        const avgRating = ratings.length
            ? Math.round((ratings.reduce((a: number, r: any) => a + r.rating, 0) / ratings.length) * 10) / 10
            : null;

        res.json({
            lawyer: {
                ...lawyer,
                lawyerProfile: parseLawyerProfile((lawyer as any).lawyerProfile),
                reviewsReceived: undefined,
                avgRating,
                totalReviews: ratings.length,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el perfil del abogado' });
    }
});

// GET /public/lawyers/:id/availability?date=YYYY-MM-DD
router.get('/lawyers/:id/availability', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const dateStr = req.query.date as string; // optional: filter for specific date

        const slots: any[] = await (prisma as any).availabilitySlot.findMany({
            where: { lawyerId: id },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });

        // If date provided, filter: include recurring slots for that day + specific slots for that date
        if (dateStr) {
            const date = new Date(dateStr);
            const dow = date.getDay();
            const filtered = slots.filter(s => {
                if (s.isRecurring) return s.dayOfWeek === dow;
                if (s.specificDate) {
                    const sd = new Date(s.specificDate);
                    return sd.toDateString() === date.toDateString();
                }
                return false;
            });

            // Fetch existing appointments for that day to mark taken slots
            const start = new Date(dateStr);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateStr);
            end.setHours(23, 59, 59, 999);

            const taken = await prisma.appointmentRequest.findMany({
                where: {
                    lawyerId: id,
                    preferredDate: { gte: start, lte: end },
                    status: { not: 'RECHAZADA' },
                },
                select: { preferredDate: true },
            });

            const takenTimes = taken.map(a => {
                const d = new Date(a.preferredDate!);
                return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
            });

            const result = filtered.map(s => ({
                ...s,
                available: !takenTimes.some(t => t >= s.startTime && t < s.endTime),
            }));

            return res.json({ slots: result, date: dateStr });
        }

        res.json({ slots });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener disponibilidad' });
    }
});

// GET /public/reviews/lawyer/:lawyerId
router.get('/reviews/lawyer/:lawyerId', async (req: Request, res: Response) => {
    try {
        const { lawyerId } = req.params;
        const reviews: any[] = await (prisma as any).review.findMany({
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
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
});

export default router;
