'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const AREAS = ['', 'PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO', 'GENERAL'];

const AREA_META: Record<string, { label: string; color: string; bg: string }> = {
    PENAL:       { label: 'Penal',       color: '#F87171', bg: 'rgba(248,113,113,0.18)' },
    CIVIL:       { label: 'Civil',       color: '#60A5FA', bg: 'rgba(96,165,250,0.18)'  },
    LOPNA:       { label: 'LOPNA',       color: '#34D399', bg: 'rgba(52,211,153,0.18)'  },
    CORPORATIVO: { label: 'Corporativo', color: '#C084FC', bg: 'rgba(192,132,252,0.18)' },
    GENERAL:     { label: 'General',     color: 'rgba(255,255,255,0.55)', bg: 'rgba(255,255,255,0.08)' },
};

function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; } },
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useReveal();
    return (
        <div ref={ref} style={{ opacity: 0, transform: 'translateY(28px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
            {children}
        </div>
    );
}

export default function BlogPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [area, setArea] = useState('');
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const p = area ? `?legalArea=${area}` : '';
        setLoading(true);
        apiFetch(`/blog${p}`).then(d => setPosts(d.posts || [])).catch(() => {}).finally(() => setLoading(false));
    }, [area]);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 80);
    }, []);

    return (
        <>
            <style>{`
                .blog-card { transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease; }
                .blog-card:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.4); transform: translateY(-4px); border-color: rgba(240,180,41,0.2) !important; }
                .area-pill { transition: all 0.25s ease; cursor: pointer; }
                .area-pill:hover { opacity: 0.85; }
            `}</style>

            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 60%, #0C2340 100%)',
                paddingTop: '140px',
                paddingBottom: '80px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(240,180,41,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div ref={heroRef} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.3)',
                            borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.5rem',
                        }}>
                            <span style={{ fontSize: '0.7rem', color: '#F0B429', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Conocimiento Legal</span>
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            lineHeight: 1.15,
                            marginBottom: '1rem',
                            letterSpacing: '-0.02em',
                        }}>
                            Blog <span style={{ color: '#F0B429' }}>Jurídico</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
                            Artículos y análisis de nuestros abogados especializados para mantenerte informado.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter bar */}
            <section style={{
                background: 'rgba(6,15,29,0.97)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                padding: '1rem 0',
                position: 'sticky',
                top: '72px',
                zIndex: 100,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}>
                <div className="container" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {AREAS.map(a => {
                        const meta = a ? AREA_META[a] : null;
                        const active = area === a;
                        return (
                            <button
                                key={a}
                                onClick={() => setArea(a)}
                                className="area-pill"
                                style={{
                                    padding: '0.4rem 1.1rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    border: active
                                        ? '1.5px solid rgba(240,180,41,0.5)'
                                        : '1.5px solid rgba(255,255,255,0.1)',
                                    background: active
                                        ? 'rgba(240,180,41,0.15)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: active ? '#F0B429' : 'rgba(255,255,255,0.6)',
                                }}
                            >
                                {a === '' ? 'Todos' : (meta?.label ?? a)}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Posts grid */}
            <section style={{ background: '#060F1D', padding: '4rem 0 6rem' }}>
                <div className="container">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
                            <div className="spinner" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.3 }}>⚖️</div>
                            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>No hay artículos publicados en esta categoría aún.</p>
                            <button onClick={() => setArea('')} style={{
                                marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '9999px',
                                border: '1.5px solid rgba(240,180,41,0.4)', background: 'rgba(240,180,41,0.08)',
                                color: '#F0B429', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
                            }}>
                                Ver todos
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
                            {posts.map((p, i) => {
                                const meta = AREA_META[p.legalArea] || AREA_META.GENERAL;
                                return (
                                    <RevealCard key={p.id} delay={i * 60}>
                                        <Link href={`/blog/${p.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                                            <div className="blog-card" style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                borderRadius: '1.25rem',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                overflow: 'hidden',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}>
                                                {/* Image / Placeholder */}
                                                {p.imageUrl ? (
                                                    <div style={{ height: '188px', background: `url(${p.imageUrl}) center/cover`, flexShrink: 0 }} />
                                                ) : (
                                                    <div style={{
                                                        height: '120px',
                                                        background: 'linear-gradient(135deg, #0C2340, #1B4D8F)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '2.8rem', flexShrink: 0,
                                                    }}>⚖️</div>
                                                )}

                                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.2rem 0.65rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 700,
                                                        background: meta.bg,
                                                        color: meta.color,
                                                        marginBottom: '0.75rem',
                                                        letterSpacing: '0.04em',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        {meta.label}
                                                    </span>

                                                    <h3 style={{
                                                        margin: '0 0 0.6rem',
                                                        fontSize: '1rem',
                                                        fontWeight: 700,
                                                        color: '#F1F5F9',
                                                        fontFamily: 'var(--font-heading)',
                                                        lineHeight: 1.4,
                                                        flex: 1,
                                                    }}>{p.title}</h3>

                                                    {p.excerpt && (
                                                        <p style={{ margin: '0 0 1rem', fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
                                                            {p.excerpt}
                                                        </p>
                                                    )}

                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                                                background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.62rem', fontWeight: 700, color: '#0C2340',
                                                            }}>
                                                                {p.author?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                                            </div>
                                                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{p.author?.name}</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>
                                                            {new Date(p.publishedAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </RevealCard>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section style={{ background: 'linear-gradient(135deg, #0C2340, #1B4D8F)', padding: '5rem 0', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
                        ¿Necesitás asesoría legal?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        Nuestros abogados especializados están listos para ayudarte.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/registro" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            Crear cuenta gratis
                        </Link>
                        <Link href="/#servicios" className="btn btn-outline-gold" style={{ textDecoration: 'none' }}>
                            Ver servicios
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
