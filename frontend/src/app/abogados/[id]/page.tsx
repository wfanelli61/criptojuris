import type { Metadata } from 'next';
import LawyerProfileClient from './LawyerProfileClient';

const API  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:4000/api';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getLawyer(id: string) {
    try {
        const r = await fetch(`${API}/public/lawyers/${id}`, { next: { revalidate: 3600 } });
        if (!r.ok) return null;
        return (await r.json()).lawyer;
    } catch { return null; }
}

async function getReviews(id: string) {
    try {
        const r = await fetch(`${API}/public/reviews/lawyer/${id}`, { next: { revalidate: 3600 } });
        return r.ok ? await r.json() : null;
    } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const lawyer = await getLawyer(id);
    if (!lawyer) return { title: 'Abogado no encontrado | BufeteLegal' };

    const profile = lawyer.lawyerProfile;
    const specialties: string[] = profile?.specialties || [];
    const description = profile?.bio
        ? `${profile.bio.slice(0, 120)}...`
        : `${lawyer.name} — Abogado verificado en ${profile?.city || 'Venezuela'}. ${specialties.slice(0,3).join(', ')}. Consulta disponible en BufeteLegal Venezuela.`;

    return {
        title: `${lawyer.name} — Abogado${profile?.city ? ` en ${profile.city}` : ''} | BufeteLegal`,
        description,
        keywords: [
            lawyer.name, 'abogado venezuela', 'abogado verificado',
            ...(specialties.map(s => `abogado ${s.toLowerCase()} venezuela`)),
            profile?.city ? `abogado ${profile.city}` : '',
        ].filter(Boolean),
        openGraph: {
            title: `${lawyer.name} | BufeteLegal Venezuela`,
            description,
            type: 'profile',
            url: `${SITE}/abogados/${id}`,
            siteName: 'BufeteLegal Venezuela',
            images: profile?.photoUrl
                ? [{ url: `${API.replace('/api', '')}${profile.photoUrl}`, width: 400, height: 400, alt: lawyer.name }]
                : [],
        },
        twitter: {
            card: 'summary',
            title: `${lawyer.name} | BufeteLegal`,
            description,
        },
        alternates: { canonical: `${SITE}/abogados/${id}` },
    };
}

export default async function LawyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [lawyer, reviewData] = await Promise.all([getLawyer(id), getReviews(id)]);

    // JSON-LD — schema.org Attorney + LocalBusiness
    const profile = lawyer?.lawyerProfile;
    const specialties: string[] = profile?.specialties || [];
    const jsonLd = lawyer ? {
        '@context': 'https://schema.org',
        '@type': ['Person', 'LegalService'],
        name: lawyer.name,
        jobTitle: 'Abogado',
        description: profile?.bio || '',
        url: `${SITE}/abogados/${id}`,
        image: profile?.photoUrl ? `${API.replace('/api','')}${profile.photoUrl}` : '',
        address: profile?.city ? {
            '@type': 'PostalAddress',
            addressLocality: profile.city,
            addressCountry: 'VE',
        } : undefined,
        knowsAbout: specialties,
        knowsLanguage: profile?.languages || ['Español'],
        priceRange: profile?.ratePerHour ? `$${profile.ratePerHour} USD/hora` : undefined,
        aggregateRating: reviewData?.stats?.total > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: reviewData.stats.average,
            ratingCount: reviewData.stats.total,
            bestRating: 5,
            worstRating: 1,
        } : undefined,
        hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            name: 'Abogado verificado por BufeteLegal Venezuela',
        },
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <LawyerProfileClient id={id} />
        </>
    );
}
