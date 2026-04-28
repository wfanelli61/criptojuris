import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getPost(slug: string) {
    try {
        const r = await fetch(`${API}/blog/${slug}`, { next: { revalidate: 3600 } });
        if (!r.ok) return null;
        return (await r.json()).post;
    } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: 'Artículo no encontrado | BufeteLegal' };

    const description = post.excerpt || post.content?.slice(0, 160) || '';
    return {
        title: post.title,
        description,
        authors: [{ name: post.author?.name || 'BufeteLegal' }],
        openGraph: {
            title: post.title,
            description,
            type: 'article',
            url: `${SITE}/blog/${slug}`,
            siteName: 'BufeteLegal Venezuela',
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author?.name],
            section: post.legalArea,
            images: post.imageUrl ? [{ url: post.imageUrl, width: 1200, height: 630 }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description,
            images: post.imageUrl ? [post.imageUrl] : [],
        },
        alternates: { canonical: `${SITE}/blog/${slug}` },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    // JSON-LD Article structured data
    const jsonLd = post ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || '',
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: { '@type': 'Person', name: post.author?.name || 'BufeteLegal' },
        publisher: {
            '@type': 'Organization',
            name: 'BufeteLegal Venezuela',
            url: SITE,
        },
        url: `${SITE}/blog/${slug}`,
        image: post.imageUrl || '',
        articleSection: post.legalArea,
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <BlogPostClient slug={slug} />
        </>
    );
}
