'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

const AREAS = ['PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO'];
const LANGUAGES = ['Español', 'Inglés', 'Portugués', 'Francés'];
const SORT_OPTIONS = [
    { value: 'name',       label: 'Nombre A–Z' },
    { value: 'price_asc',  label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'experience', label: 'Más experiencia' },
];

interface Filters {
    search: string; city: string; specialty: string;
    minPrice: string; maxPrice: string; minYears: string;
    language: string; sortBy: string;
}

const DEFAULT: Filters = {
    search: '', city: '', specialty: '', minPrice: '',
    maxPrice: '', minYears: '', language: '', sortBy: 'name',
};

const iStyle: React.CSSProperties = {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.55rem',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
    color: '#F1F5F9', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box',
};

const PAGE_SIZE = 9;

export default function BuscarAbogadosPage() {
    const [lawyers, setLawyers]       = useState<any[]>([]);
    const [total, setTotal]           = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage]             = useState(1);
    const [loading, setLoading]       = useState(true);
    const [filters, setFilters]       = useState<Filters>(DEFAULT);
    const [applied, setApplied]       = useState<Filters>(DEFAULT);

    const doFetch = useCallback(async (f: Filters, p: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE), sortBy: f.sortBy });
            if (f.search)    params.set('search', f.search);
            if (f.city)      params.set('city', f.city);
            if (f.specialty) params.set('specialty', f.specialty);
            if (f.minPrice)  params.set('minPrice', f.minPrice);
            if (f.maxPrice)  params.set('maxPrice', f.maxPrice);
            if (f.minYears)  params.set('minYears', f.minYears);
            if (f.language)  params.set('language', f.language);
            const data = await apiFetch(`/public/lawyers?${params}`);
            setLawyers(data.lawyers || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch { setLawyers([]); }
        setLoading(false);
    }, []);

    useEffect(() => { doFetch(applied, page); }, [applied, page, doFetch]);

    const set = (key: keyof Filters, val: string) => setFilters(f => ({ ...f, [key]: val }));
    const apply = () => { setApplied({ ...filters }); setPage(1); };
    const reset = () => { setFilters(DEFAULT); setApplied(DEFAULT); setPage(1); };

    const chips: { key: keyof Filters; label: string }[] = [];
    if (applied.search)    chips.push({ key: 'search',    label: `"${applied.search}"` });
    if (applied.city)      chips.push({ key: 'city',      label: `📍 ${applied.city}` });
    if (applied.specialty) chips.push({ key: 'specialty', label: `⚖️ ${applied.specialty}` });
    if (applied.minPrice)  chips.push({ key: 'minPrice',  label: `≥ $${applied.minPrice}/h` });
    if (applied.maxPrice)  chips.push({ key: 'maxPrice',  label: `≤ $${applied.maxPrice}/h` });
    if (applied.minYears)  chips.push({ key: 'minYears',  label: `≥ ${applied.minYears} años exp.` });
    if (applied.language)  chips.push({ key: 'language',  label: `🌐 ${applied.language}` });

    const removeChip = (key: keyof Filters) => {
        const next = { ...applied, [key]: DEFAULT[key] };
        setFilters(next); setApplied(next); setPage(1);
    };

    return (
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    Buscar <span style={{ color: '#F0B429' }}>Abogados</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    {loading ? 'Buscando...' : `${total} abogado${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''} en el directorio`}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* ── FILTROS ── */}
                <aside style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '1rem', padding: '1.25rem', position: 'sticky', top: '1.5rem',
                }}>
                    <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.85rem', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🎛 Filtros
                    </div>

                    <Field label="Nombre">
                        <input style={iStyle} placeholder="Ej: Carlos Martínez" value={filters.search} onChange={e => set('search', e.target.value)} />
                    </Field>

                    <Field label="Ciudad">
                        <input style={iStyle} placeholder="Ej: Caracas" value={filters.city} onChange={e => set('city', e.target.value)} />
                    </Field>

                    <Field label="Área jurídica">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
                            {AREAS.map(a => (
                                <button key={a} onClick={() => set('specialty', filters.specialty === a ? '' : a)} style={{
                                    padding: '0.22rem 0.55rem', borderRadius: '9999px', fontSize: '0.67rem', fontWeight: 700,
                                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                                    background: filters.specialty === a ? '#F0B429' : 'rgba(255,255,255,0.07)',
                                    color: filters.specialty === a ? '#0C2340' : 'rgba(255,255,255,0.55)',
                                }}>{a}</button>
                            ))}
                        </div>
                        <input style={iStyle} placeholder="Otra especialidad..." value={AREAS.includes(filters.specialty) ? '' : filters.specialty} onChange={e => set('specialty', e.target.value)} />
                    </Field>

                    <Field label="Tarifa/hora (USD)">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                            <input style={iStyle} type="number" placeholder="Mín." value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} />
                            <input style={iStyle} type="number" placeholder="Máx." value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
                        </div>
                    </Field>

                    <Field label={`Experiencia mínima${filters.minYears ? ` — ${filters.minYears} años` : ''}`}>
                        <input type="range" min="0" max="30" step="1" value={filters.minYears || '0'}
                            onChange={e => set('minYears', e.target.value === '0' ? '' : e.target.value)}
                            style={{ width: '100%', accentColor: '#F0B429' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
                            <span>0</span><span>30 años</span>
                        </div>
                    </Field>

                    <Field label="Idioma">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {LANGUAGES.map(l => (
                                <button key={l} onClick={() => set('language', filters.language === l ? '' : l)} style={{
                                    padding: '0.22rem 0.55rem', borderRadius: '9999px', fontSize: '0.67rem', fontWeight: 700,
                                    cursor: 'pointer', border: 'none',
                                    background: filters.language === l ? '#F0B429' : 'rgba(255,255,255,0.07)',
                                    color: filters.language === l ? '#0C2340' : 'rgba(255,255,255,0.55)',
                                }}>{l}</button>
                            ))}
                        </div>
                    </Field>

                    <Field label="Ordenar por">
                        <select value={filters.sortBy} onChange={e => set('sortBy', e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </Field>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button onClick={apply} style={{ flex: 2, padding: '0.6rem', borderRadius: '0.55rem', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#F0B429,#C68A0A)', color: '#0C2340', fontWeight: 700, fontSize: '0.82rem' }}>
                            Aplicar
                        </button>
                        {chips.length > 0 && (
                            <button onClick={reset} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.55rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', cursor: 'pointer' }}>
                                Limpiar
                            </button>
                        )}
                    </div>
                </aside>

                {/* ── RESULTADOS ── */}
                <div>
                    {/* Chips activos */}
                    {chips.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                            {chips.map(c => (
                                <span key={c.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.22rem 0.65rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(240,180,41,0.12)', color: '#F0B429', border: '1px solid rgba(240,180,41,0.22)' }}>
                                    {c.label}
                                    <button onClick={() => removeChip(c.key)} style={{ background: 'none', border: 'none', color: '#F0B429', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>×</button>
                                </span>
                            ))}
                            <button onClick={reset} style={{ padding: '0.22rem 0.65rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                Limpiar todo ×
                            </button>
                        </div>
                    )}

                    {/* Grid de abogados */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', height: '190px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : lawyers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>Sin resultados con esos criterios</p>
                            <button onClick={reset} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.6rem', background: '#F0B429', color: '#0C2340', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
                            {lawyers.map(l => <LawyerCard key={l.id} lawyer={l} />)}
                        </div>
                    )}

                    {/* Paginación */}
                    {!loading && totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.45rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: page === 1 ? 'rgba(255,255,255,0.2)' : '#F1F5F9', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>← Anterior</button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                if (p < 1 || p > totalPages) return null;
                                return (
                                    <button key={p} onClick={() => setPage(p)} style={{ width: '34px', height: '34px', borderRadius: '0.45rem', border: 'none', cursor: 'pointer', background: p === page ? '#F0B429' : 'rgba(255,255,255,0.05)', color: p === page ? '#0C2340' : 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700 }}>{p}</button>
                                );
                            })}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.45rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: page === totalPages ? 'rgba(255,255,255,0.2)' : '#F1F5F9', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Siguiente →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>{label}</label>
            {children}
        </div>
    );
}

function LawyerCard({ lawyer }: { lawyer: any }) {
    const profile = lawyer.lawyerProfile;
    const specialties: string[] = profile?.specialties || [];
    const langs: string[] = profile?.languages || [];

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'rgba(240,180,41,0.25)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.transform = 'none'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.boxShadow = 'none'; }}
        >
            {/* Avatar + nombre */}
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#C68A0A,#F0B429)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#0C2340' }}>
                    {profile?.photoUrl
                        ? <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${profile.photoUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : lawyer.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.9rem', color: '#F1F5F9', fontWeight: 700, margin: '0 0 0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lawyer.name}</h3>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {profile?.city && <span>📍 {profile.city}</span>}
                        {profile?.yearsExperience && <span>⏱ {profile.yearsExperience} años exp.</span>}
                    </div>
                </div>
            </div>

            {/* Especialidades */}
            {specialties.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {specialties.slice(0, 3).map(s => (
                        <span key={s} style={{ background: 'rgba(240,180,41,0.1)', color: 'rgba(240,180,41,0.85)', padding: '0.17rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.62rem', fontWeight: 600, border: '1px solid rgba(240,180,41,0.18)' }}>{s}</span>
                    ))}
                    {specialties.length > 3 && <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', alignSelf: 'center' }}>+{specialties.length - 3}</span>}
                </div>
            )}

            {/* Bio */}
            {profile?.bio && (
                <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                    {profile.bio}
                </p>
            )}

            {/* Idiomas */}
            {langs.length > 0 && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {langs.slice(0, 3).map(l => (
                        <span key={l} style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '0.3rem' }}>🌐 {l}</span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                <div>
                    {profile?.ratePerHour ? (
                        <span style={{ fontWeight: 900, color: '#F0B429', fontSize: '1.05rem' }}>${profile.ratePerHour}<span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.68rem', fontWeight: 400 }}>/hora</span></span>
                    ) : (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)' }}>Consultar tarifa</span>
                    )}
                    {lawyer.avgRating ? (
                        <div style={{ fontSize: '0.65rem', color: '#F0B429', marginTop: '0.1rem' }}>
                            {'★'.repeat(Math.round(lawyer.avgRating))}{'☆'.repeat(5 - Math.round(lawyer.avgRating))}
                            <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: '0.25rem' }}>{lawyer.avgRating} ({lawyer.totalReviews})</span>
                        </div>
                    ) : (
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.1rem' }}>Sin calificaciones aún</div>
                    )}
                </div>
                <Link href={`/abogados/${lawyer.id}`} style={{ padding: '0.42rem 1rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem', background: 'linear-gradient(135deg,#F0B429,#C68A0A)', color: '#0C2340', textDecoration: 'none' }}>
                    Ver perfil →
                </Link>
            </div>
        </div>
    );
}
