'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');

const AREA_COLOR: Record<string, { bg: string; color: string }> = {
    PENAL:       { bg: 'rgba(248,113,113,0.15)', color: '#F87171' },
    CIVIL:       { bg: 'rgba(96,165,250,0.15)',  color: '#60A5FA' },
    LOPNA:       { bg: 'rgba(52,211,153,0.15)',  color: '#34D399' },
    CORPORATIVO: { bg: 'rgba(192,132,252,0.15)', color: '#C084FC' },
};

function Stars({ n, size = '1rem' }: { n: number; size?: string }) {
    return (
        <span style={{ fontSize: size, letterSpacing: '0.05em' }}>
            {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= Math.round(n) ? '#F0B429' : 'rgba(255,255,255,0.15)' }}>★</span>
            ))}
        </span>
    );
}

export default function LawyerProfileClient({ id }: { id: string }) {
    const router  = useRouter();
    const { user } = useAuth();

    const [lawyer,     setLawyer]     = useState<any>(null);
    const [services,   setServices]   = useState<any[]>([]);
    const [stats,      setStats]      = useState<any>(null);
    const [reviews,    setReviews]    = useState<any[]>([]);
    const [loading,    setLoading]    = useState(true);

    const [showForm,   setShowForm]   = useState(false);
    const [form,       setForm]       = useState({ serviceId: '', message: '', preferredDate: '' });
    const [slots,      setSlots]      = useState<any[]>([]);
    const [loadSlots,  setLoadSlots]  = useState(false);
    const [selDate,    setSelDate]    = useState('');
    const [selSlot,    setSelSlot]    = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success,    setSuccess]    = useState('');
    const [error,      setError]      = useState('');

    useEffect(() => {
        Promise.all([
            apiFetch(`/public/lawyers/${id}`),
            apiFetch('/public/services'),
            apiFetch(`/public/reviews/lawyer/${id}`),
        ]).then(([l, s, r]) => {
            setLawyer(l.lawyer); setServices(s.services);
            setStats(r.stats); setReviews(r.reviews);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [id]);

    const fetchSlots = async (date: string) => {
        if (!date) { setSlots([]); return; }
        setLoadSlots(true);
        try {
            const d = await apiFetch(`/public/lawyers/${id}/availability?date=${date}`);
            setSlots(d.slots || []);
        } catch { setSlots([]); }
        setLoadSlots(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { router.push('/login'); return; }
        setSubmitting(true); setError('');
        try {
            await apiFetch('/clients/me/appointments', {
                method: 'POST',
                body: JSON.stringify({ lawyerId: id, serviceId: form.serviceId, message: form.message, preferredDate: form.preferredDate || undefined }),
            });
            setSuccess('¡Solicitud enviada! El abogado te contactará pronto.'); setShowForm(false);
        } catch (err: any) { setError(err.message || 'Error al enviar'); }
        setSubmitting(false);
    };

    const handleChat = async () => {
        if (!user) { router.push('/login'); return; }
        try {
            await apiFetch('/chat/conversations', { method: 'POST', body: JSON.stringify({ targetUserId: id }) });
            router.push('/dashboard/chat');
        } catch (err: any) { setError(err.message || 'Error'); }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#060F1D', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '8rem' }}>
            <div className="spinner" />
        </div>
    );
    if (!lawyer) return (
        <div style={{ minHeight: '100vh', background: '#060F1D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '8rem', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
            <p>Abogado no encontrado</p>
            <Link href="/abogados" style={{ color: '#F0B429', marginTop: '1rem', textDecoration: 'none' }}>← Volver al directorio</Link>
        </div>
    );

    const profile = lawyer.lawyerProfile;
    const specialties: string[] = profile?.specialties || [];
    const languages: string[]   = profile?.languages   || [];
    const initials = lawyer.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

    const iStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.9rem',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '0.6rem', color: '#F1F5F9', fontSize: '0.88rem',
        outline: 'none', boxSizing: 'border-box',
    };

    return (
        <div style={{ background: '#060F1D', minHeight: '100vh' }}>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{
                background: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 60%, #0C2340 100%)',
                paddingTop: '8rem', paddingBottom: '3rem', position: 'relative', overflow: 'hidden',
            }}>
                {/* decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(240,180,41,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

                <div className="container" style={{ maxWidth: '960px', position: 'relative', zIndex: 1 }}>
                    {/* Back link */}
                    <Link href="/abogados" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', textDecoration: 'none', marginBottom: '2rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#F0B429')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                        ← Directorio de abogados
                    </Link>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
                                background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem', fontWeight: 800, color: '#0C2340',
                                boxShadow: '0 8px 32px rgba(240,180,41,0.35)',
                                border: '3px solid rgba(240,180,41,0.3)',
                            }}>
                                {profile?.photoUrl
                                    ? <img src={`${API_BASE}${profile.photoUrl}`} alt={lawyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : initials}
                            </div>
                            {/* Verified badge */}
                            <div style={{
                                position: 'absolute', bottom: '4px', right: '4px',
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #060F1D', fontSize: '0.75rem',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                            }}>✓</div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#F1F5F9', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                                    {lawyer.name}
                                </h1>
                                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}>
                                    ✓ Verificado
                                </span>
                            </div>

                            {/* Meta pills */}
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {profile?.city && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                                        📍 {profile.city}
                                    </span>
                                )}
                                {profile?.yearsExperience && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                                        ⏱ {profile.yearsExperience} años de experiencia
                                    </span>
                                )}
                                {languages.length > 0 && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                                        🌐 {languages.slice(0, 2).join(', ')}
                                    </span>
                                )}
                            </div>

                            {/* Specialties */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                                {specialties.map(s => {
                                    const ac = AREA_COLOR[s.toUpperCase()] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' };
                                    return (
                                        <span key={s} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: ac.bg, color: ac.color, border: `1px solid ${ac.color}30` }}>
                                            {s}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Rating preview */}
                            {stats && stats.total > 0 && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '9999px' }}>
                                    <Stars n={stats.average} size="0.85rem" />
                                    <span style={{ fontSize: '0.8rem', color: '#F0B429', fontWeight: 700 }}>{Number(stats.average).toFixed(1)}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>({stats.total} {stats.total === 1 ? 'calificación' : 'calificaciones'})</span>
                                </div>
                            )}
                        </div>

                        {/* Rate card (desktop) */}
                        {profile?.ratePerHour && (
                            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '1rem', padding: '1.25rem 1.5rem', textAlign: 'center', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Tarifa</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F0B429', lineHeight: 1 }}>${profile.ratePerHour}</div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>por hora</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BODY ─────────────────────────────────────────────────────── */}
            <div className="container" style={{ maxWidth: '960px', padding: '2.5rem 1rem 4rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

                {/* ── LEFT COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Bio */}
                    {profile?.bio && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.85rem' }}>
                                Sobre el abogado
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, fontSize: '0.92rem', margin: 0 }}>{profile.bio}</p>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div style={{ padding: '1rem 1.25rem', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '0.75rem', color: '#34D399', fontWeight: 500, fontSize: '0.88rem' }}>
                            ✅ {success}
                        </div>
                    )}
                    {error && (
                        <div style={{ padding: '1rem 1.25rem', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '0.75rem', color: '#F87171', fontSize: '0.88rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Reviews */}
                    {stats && stats.total > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                                ⭐ Calificaciones verificadas
                            </div>

                            {/* Summary */}
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>{Number(stats.average).toFixed(1)}</div>
                                    <Stars n={stats.average} size="1.1rem" />
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.3rem' }}>
                                        {stats.total} {stats.total === 1 ? 'calificación' : 'calificaciones'}
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '160px' }}>
                                    {stats.distribution.map((d: any) => (
                                        <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', width: '10px', textAlign: 'right' }}>{d.stars}</span>
                                            <span style={{ color: '#F0B429', fontSize: '0.75rem' }}>★</span>
                                            <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '9999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: 'linear-gradient(90deg,#F0B429,#F6D365)', borderRadius: '9999px', width: stats.total > 0 ? `${(d.count / stats.total) * 100}%` : '0%', transition: 'width 0.6s ease' }} />
                                            </div>
                                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', width: '14px' }}>{d.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Review cards */}
                            <div style={{ display: 'grid', gap: '0.85rem' }}>
                                {reviews.slice(0, 6).map((r: any) => (
                                    <div key={r.id} style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#C68A0A,#F0B429)', color: '#0C2340', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
                                                    {r.client?.name?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9' }}>{r.client?.name || 'Cliente verificado'}</div>
                                                    {r.case && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{r.case.title} · {r.case.legalArea}</div>}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <Stars n={r.rating} size="0.85rem" />
                                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.1rem' }}>
                                                    {new Date(r.createdAt).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        {r.comment && (
                                            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>
                                                "{r.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN (sticky) ── */}
                <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* CTA Card */}
                    {!success && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                Contactar
                            </div>

                            {(!user || user.role === 'CLIENTE') ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    <button
                                        onClick={() => user ? setShowForm(f => !f) : router.push('/login')}
                                        style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#F0B429,#C68A0A)', color: '#0C2340', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(240,180,41,0.3)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(240,180,41,0.45)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(240,180,41,0.3)'; }}
                                    >
                                        📋 Solicitar consulta
                                    </button>
                                    <button
                                        onClick={handleChat}
                                        style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.06)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                                    >
                                        💬 Chatear ahora
                                    </button>
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
                                    Inicia sesión como cliente para solicitar una consulta.
                                </p>
                            )}

                            {/* Quick info */}
                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {profile?.ratePerHour && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Tarifa/hora</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F0B429' }}>${profile.ratePerHour} USD</span>
                                    </div>
                                )}
                                {profile?.city && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Ubicación</span>
                                        <span style={{ fontSize: '0.82rem', color: '#F1F5F9' }}>📍 {profile.city}</span>
                                    </div>
                                )}
                                {profile?.yearsExperience && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Experiencia</span>
                                        <span style={{ fontSize: '0.82rem', color: '#F1F5F9' }}>⏱ {profile.yearsExperience} años</span>
                                    </div>
                                )}
                                {languages.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Idiomas</span>
                                        <span style={{ fontSize: '0.82rem', color: '#F1F5F9' }}>🌐 {languages.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Appointment Form */}
                    {showForm && !success && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.1rem' }}>
                                Datos de la consulta
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Servicio *</label>
                                    <select value={form.serviceId} onChange={e => setForm(f => ({...f, serviceId: e.target.value}))} required style={{ ...iStyle, cursor: 'pointer' }}>
                                        <option value="">Selecciona un servicio</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Fecha preferida</label>
                                    <input type="date" value={selDate} min={new Date().toISOString().split('T')[0]}
                                        onChange={e => { setSelDate(e.target.value); setSelSlot(''); fetchSlots(e.target.value); }}
                                        style={iStyle} />
                                </div>
                                {selDate && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Horario</label>
                                        {loadSlots ? (
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', padding: '0.4rem 0' }}>Cargando horarios...</div>
                                        ) : slots.length === 0 ? (
                                            <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#F0B429' }}>
                                                ⚠️ Sin horarios disponibles para esta fecha
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                {slots.map((slot: any) => {
                                                    const key = `${selDate}T${slot.startTime}`;
                                                    const isSelected = selSlot === key;
                                                    const unavailable = slot.available === false;
                                                    return (
                                                        <button key={slot.id} type="button" disabled={unavailable}
                                                            onClick={() => { setSelSlot(key); setForm(f => ({...f, preferredDate: key})); }}
                                                            style={{ padding: '0.38rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 600, cursor: unavailable ? 'not-allowed' : 'pointer', border: '1.5px solid', transition: 'all 0.15s', borderColor: isSelected ? '#F0B429' : unavailable ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)', background: isSelected ? 'rgba(240,180,41,0.15)' : 'rgba(255,255,255,0.04)', color: isSelected ? '#F0B429' : unavailable ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)', textDecoration: unavailable ? 'line-through' : 'none' }}>
                                                            {slot.startTime}–{slot.endTime}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Descripción del caso</label>
                                    <textarea rows={3} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                                        placeholder="Describa brevemente su situación legal..."
                                        style={{ ...iStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: '80px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg,#F0B429,#C68A0A)', color: '#0C2340', border: 'none', borderRadius: '0.65rem', fontWeight: 700, fontSize: '0.88rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                                        {submitting ? 'Enviando...' : 'Enviar solicitud'}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.65rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', cursor: 'pointer' }}>
                                        ✕
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {success && (
                        <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                            <p style={{ color: '#34D399', fontWeight: 600, margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{success}</p>
                            <Link href="/dashboard" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.55rem 1.25rem', background: '#F0B429', color: '#0C2340', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                                Ir al dashboard →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive: stack columns on mobile */}
            <style>{`
                @media (max-width: 768px) {
                    .container { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
