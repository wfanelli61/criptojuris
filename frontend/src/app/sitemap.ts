import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:4000/api';

async function safeFetch(url: string) {
    try { return await fetch(url, { next: { revalidate: 3600 } }).then(r => r.json()); }
    catch { return null; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const statics: MetadataRoute.Sitemap = [
        { url: SITE_URL,                          lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
        { url: `${SITE_URL}/abogados`,            lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
        { url: `${SITE_URL}/blog`,                lastModified: now, changeFrequency: 'daily',  priority: 0.8 },
        { url: `${SITE_URL}/para-abogados`,       lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/login`,               lastModified: now, changeFrequency: 'monthly',priority: 0.4 },
        { url: `${SITE_URL}/registro`,            lastModified: now, changeFrequency: 'monthly',priority: 0.5 },
    ];

    // Perfiles de abogados
    const lawyersData = await safeFetch(`${API_URL}/public/lawyers?limit=200&page=1`);
    const lawyerPages: MetadataRoute.Sitemap = (lawyersData?.lawyers || []).map((l: any) => ({
        url: `${SITE_URL}/abogados/${l.id}`,
        lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    // Artículos del blog
    const blogData = await safeFetch(`${API_URL}/blog?limit=200&page=1`);
    const blogPages: MetadataRoute.Sitemap = (blogData?.posts || [])
        .filter((p: any) => p.published)
        .map((p: any) => ({
            url: `${SITE_URL}/blog/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.75,
        }));

    return [...statics, ...lawyerPages, ...blogPages];
}
