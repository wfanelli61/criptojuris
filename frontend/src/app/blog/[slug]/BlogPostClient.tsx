'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const AREA_META: Record<string, { label: string; color: string; bg: string }> = {
    PENAL:       { label: 'Penal',       color: '#F87171', bg: 'rgba(248,113,113,0.18)' },
    CIVIL:       { label: 'Civil',       color: '#60A5FA', bg: 'rgba(96,165,250,0.18)'  },
    LOPNA:       { label: 'LOPNA',       color: '#34D399', bg: 'rgba(52,211,153,0.18)'  },
    CORPORATIVO: { label: 'Corporativo', color: '#C084FC', bg: 'rgba(192,132,252,0.18)' },
    GENERAL:     { label: 'General',     color: 'rgba(255,255,255,0.55)', bg: 'rgba(255,255,255,0.08)' },
};

export default function BlogPostClient({ slug }: { slug: string }) {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        apiFetch(`/blog/${slug}`, {}).then(d => setPost(d.post)).catch(() => {}).finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!post) return;
        [heroRef, contentRef].forEach((ref, i) => {
            const el = ref.current;
            if (!el) return;
            setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 80 + i * 120);
        });
    }, [post]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060F1D' }}>
            <div className="spinner" />
        </div>
    );

    if (!post) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060F1D', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>📄</div>
            <h2 style={{ color: '#F1F5F9', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Artículo no encontrado</h2>
            <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>El artículo que buscás no existe o fue eliminado.</p>
            <Link href="/blog" className="btn btn-primary" style={{ textDecoration: 'none' }}>← Volver al blog</Link>
        </div>
    );

    const meta = AREA_META[post.legalArea] || AREA_META.GENERAL;
    const initials = post.author?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '?';

    return (
        <>
            <style>{`
                .post-content { color: rgba(255,255,255,0.78); font-size: 1rem; line-height: 1.9; white-space: pre-wrap; }
                .post-content p { margin-bottom: 1.25rem; }
            `}</style>

            {/* Hero / Header */}
            <section style={{
                background: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 60%, #0C2340 100%)',
                paddingTop: '130px',
                paddingBottom: '60px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '420px', height: '420px', borderRadius: '50%', background: 'rgba(240,180,41,0.05)', pointerEvents: 'none' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <div ref={heroRef} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease' }}>
                        <Link href="/blog" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            color: 'rgba(255,255,255,0.55)', fontSize: '0.83rem', textDecoration: 'none',
                            marginBottom: '1.5rem', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#F0B429')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                        >
                            ← Volver al blog
                        </Link>

                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                padding: '0.25rem 0.8rem', borderRadius: '9999px', fontSize: '0.72rem',
                                fontWeight: 700, background: meta.bg, color: meta.color,
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                            }}>{meta.label}</span>
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            lineHeight: 1.2,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em',
                        }}>{post.title}</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.82rem', fontWeight: 700, color: '#0C2340',
                            }}>{initials}</div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{post.author?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                    {new Date(post.publishedAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cover image */}
            {post.imageUrl && (
                <div style={{ background: '#060F1D', maxWidth: '800px', margin: '0 auto', marginTop: '-1px' }}>
                    <div style={{ height: '320px', background: `url(${post.imageUrl}) center/cover` }} />
                </div>
            )}

            {/* Content */}
            <section style={{ background: '#060F1D', padding: '4rem 0 6rem' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div ref={contentRef} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: 'clamp(1.5rem, 4vw, 3rem)',
                            boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
                        }}>
                            <div className="post-content">{post.content}</div>
                        </div>

                        {/* Footer nav */}
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <Link href="/blog" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                                padding: '0.55rem 1.25rem', borderRadius: '9999px',
                                border: '1.5px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.06)',
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)'; e.currentTarget.style.background = 'rgba(240,180,41,0.08)'; e.currentTarget.style.color = '#F0B429'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                            >
                                ← Ver más artículos
                            </Link>

                            <Link href="/registro" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.88rem' }}>
                                Consultar con un abogado
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
