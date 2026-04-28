'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Metrics {
    totalUsers: number; totalLawyers: number; totalClients: number;
    totalAppointments: number; pendingAppointments: number; totalServices: number;
}
interface Appointment {
    id: string; message?: string; preferredDate?: string; status: string; createdAt: string;
    service: { id: string; name: string };
    client?: { id: string; name: string; email: string };
    lawyer?: { id: string; name: string };
}

const Icons = {
    Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Clock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Check:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    Users:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Scale:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 18l9 3 9-3"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
    User:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Message:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    Briefcase:() => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    Shield:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Arrow:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Folder:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    Book:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    Star:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

const STATUS: Record<string, { label: string; color: string; dot: string }> = {
    PENDIENTE:  { label: 'Pendiente',  color: '#FBBF24', dot: '#F59E0B' },
    CONFIRMADA: { label: 'Confirmada', color: '#34D399', dot: '#10B981' },
    CANCELADA:  { label: 'Cancelada',  color: '#F87171', dot: '#EF4444' },
    FINALIZADA: { label: 'Finalizada', color: '#60A5FA', dot: '#3B82F6' },
};

const CASE_ST: Record<string, { color: string; bg: string; label: string }> = {
    SOLICITUD:            { color: '#F0B429', bg: 'rgba(240,180,41,0.15)',    label: 'Solicitud' },
    PRESUPUESTO_ENVIADO:  { color: '#FB923C', bg: 'rgba(251,146,60,0.15)',    label: 'Presupuesto enviado' },
    PRESUPUESTO_APROBADO: { color: '#34D399', bg: 'rgba(52,211,153,0.15)',    label: 'Presupuesto aprobado' },
    CONTRATO_FIRMADO:     { color: '#60A5FA', bg: 'rgba(96,165,250,0.15)',    label: 'Contrato firmado' },
    EN_CURSO:             { color: '#C084FC', bg: 'rgba(192,132,252,0.15)',   label: 'En curso' },
    CERRADO:              { color: '#34D399', bg: 'rgba(52,211,153,0.12)',    label: 'Cerrado' },
    CANCELADO:            { color: '#F87171', bg: 'rgba(248,113,113,0.12)',   label: 'Cancelado' },
};

const AREA_COLOR: Record<string, string> = {
    PENAL: '#F87171', CIVIL: '#60A5FA', LOPNA: '#C084FC', CORPORATIVO: '#F0B429',
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [metrics, setMetrics]       = useState<Metrics | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeCases, setActiveCases]   = useState<any[]>([]);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                if (user.role === 'ADMIN') {
                    const [m, a] = await Promise.all([
                        apiFetch('/admin/metrics'),
                        apiFetch('/admin/appointments?limit=5'),
                    ]);
                    setMetrics(m.metrics);
                    setAppointments(a.appointments || []);
                } else if (user.role === 'ABOGADO') {
                    const [a, c] = await Promise.all([
                        apiFetch('/lawyers/me/appointments').catch(() => ({ appointments: [] })),
                        apiFetch('/cases').catch(() => ({ cases: [] })),
                    ]);
                    setAppointments(a.appointments || []);
                    setActiveCases(c.cases || []);
                } else {
                    const [a, c] = await Promise.all([
                        apiFetch('/clients/me/appointments').catch(() => ({ appointments: [] })),
                        apiFetch('/cases').catch(() => ({ cases: [] })),
                    ]);
                    setAppointments(a.appointments || []);
                    setActiveCases((c.cases || []).filter((x: any) => !['CERRADO', 'CANCELADO'].includes(x.status)));
                }
            } catch { }
            setLoading(false);
        })();
    }, [user]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

    const h = new Date().getHours();
    const greeting = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    const pending   = appointments.filter(a => a.status === 'PENDIENTE').length;
    const confirmed = appointments.filter(a => a.status === 'CONFIRMADA').length;

    // ── ABOGADO dashboard ─────────────────────────────────────────────────────
    if (user?.role === 'ABOGADO') {
        const totalCases  = activeCases.length;
        const enCurso     = activeCases.filter(c => c.status === 'EN_CURSO').length;
        const sinAsignar  = activeCases.filter(c => c.status === 'SOLICITUD' && !c.lawyerId).length;
        const cerrados    = activeCases.filter(c => c.status === 'CERRADO').length;
        const pendAppts   = appointments.filter(a => a.status === 'PENDIENTE').length;
        const confAppts   = appointments.filter(a => a.status === 'CONFIRMADA').length;

        const casosActivos   = activeCases.filter(c => !['CERRADO','CANCELADO'].includes(c.status));
        const casosCerrados  = activeCases.filter(c => c.status === 'CERRADO');
        const casosRecientes = [...casosActivos].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        const citasProximas  = [...appointments].sort((a,b) => new Date(a.preferredDate||a.createdAt).getTime() - new Date(b.preferredDate||b.createdAt).getTime()).filter(a => a.status !== 'CANCELADA').slice(0, 4);

        // Distribución por área
        const areaCounts: Record<string,number> = {};
        activeCases.forEach(c => { areaCounts[c.legalArea] = (areaCounts[c.legalArea]||0)+1; });

        return (
            <div style={{ maxWidth: 1060, margin: '0 auto', width: '100%', color: '#E2E8F0' }}>

                {/* Saludo */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>Panel del Abogado</p>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>
                        {greeting}, <span style={{ color: '#F0B429' }}>{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                        {new Date().toLocaleDateString('es-VE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                    </p>
                </div>

                {/* Métricas principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '0', marginBottom: '2rem', borderRadius: '0.875rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {[
                        { label: 'Expedientes', value: totalCases,  accent: '#60A5FA', icon: '📁' },
                        { label: 'En curso',    value: enCurso,     accent: '#C084FC', icon: '⚖️' },
                        { label: 'Cerrados',    value: cerrados,    accent: '#34D399', icon: '✅' },
                        { label: 'Citas hoy',   value: confAppts,   accent: '#F0B429', icon: '📅' },
                        { label: 'Pendientes',  value: pendAppts,   accent: '#FBBF24', icon: '⏳' },
                    ].map((m, i, arr) => (
                        <div key={m.label} style={{
                            padding: '1.25rem 1.1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRight: i < arr.length-1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{m.label}</span>
                                <span style={{ fontSize: '1rem' }}>{m.icon}</span>
                            </div>
                            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F1F5F9', lineHeight: 1 }}>{m.value}</div>
                            <div style={{ marginTop: '0.5rem', height: '2px', borderRadius: 9999, background: m.accent, opacity: 0.45 }} />
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

                    {/* Expedientes activos */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                📁 Expedientes activos
                            </span>
                            <Link href="/dashboard/casos" style={{ fontSize: '0.75rem', color: '#F0B429', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</Link>
                        </div>
                        <div style={{ padding: '0.5rem 0' }}>
                            {casosRecientes.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
                                    No tenés expedientes activos aún.
                                </div>
                            ) : casosRecientes.map((c, i, arr) => {
                                const st = CASE_ST[c.status] || { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: c.status };
                                return (
                                    <Link key={c.id} href={`/dashboard/casos/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                        <div style={{ padding: '0.75rem 1.25rem', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>
                                                        {c.caseNumber} · {c.client?.name || 'Cliente'}
                                                    </div>
                                                </div>
                                                <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                    {st.label}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: AREA_COLOR[c.legalArea] || '#94A3B8', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{c.legalArea}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Próximas citas */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem' }}>📅 Próximas citas</span>
                                <Link href="/dashboard/mis-citas" style={{ fontSize: '0.75rem', color: '#F0B429', fontWeight: 600, textDecoration: 'none' }}>Ver todas →</Link>
                            </div>
                            <div>
                                {citasProximas.length === 0 ? (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>No hay citas próximas.</div>
                                ) : citasProximas.map((a, i, arr) => {
                                    const s = STATUS[a.status] || { label: a.status, color: '#94A3B8', dot: '#94A3B8' };
                                    return (
                                        <div key={a.id} style={{ padding: '0.75rem 1.25rem', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.83rem' }}>{a.client?.name || 'Cliente'}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>
                                                    {a.service?.name} · {a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('es-VE', { day:'2-digit', month:'short' }) : '—'}
                                                </div>
                                            </div>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: s.color }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Distribución por área */}
                        {Object.keys(areaCounts).length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.25rem' }}>
                                <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem', marginBottom: '0.85rem' }}>⚖️ Casos por área jurídica</div>
                                <div style={{ display: 'grid', gap: '0.55rem' }}>
                                    {Object.entries(areaCounts).sort((a,b)=>b[1]-a[1]).map(([area, count]) => (
                                        <div key={area}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: AREA_COLOR[area]||'#94A3B8', display: 'inline-block' }} />
                                                    {area}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{count} caso{count!==1?'s':''}</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: AREA_COLOR[area]||'#60A5FA', borderRadius: 9999, width: `${totalCases>0?(count/totalCases)*100:0}%`, transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones rápidas */}
                <div style={{ marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.75rem' }}>Acciones rápidas</p>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <Btn href="/dashboard/casos" primary icon={<Icons.Folder />}>Ver expedientes</Btn>
                        <Btn href="/dashboard/mis-citas" icon={<Icons.Calendar />}>Mis citas</Btn>
                        <Btn href="/dashboard/chat" icon={<Icons.Message />}>Mensajes</Btn>
                        <Btn href="/dashboard/normas" icon={<Icons.Book />}>Normas jurídicas</Btn>
                        <Btn href="/dashboard/mi-perfil" icon={<Icons.User />}>Mi perfil</Btn>
                        <Btn href="/dashboard/blog" icon={<Icons.Star />}>Mis artículos</Btn>
                    </div>
                </div>
            </div>
        );
    }

    // ── ADMIN dashboard ───────────────────────────────────────────────────────
    // ── CLIENTE dashboard ─────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 1060, margin: '0 auto', width: '100%', color: '#E2E8F0' }}>

            {/* Saludo */}
            <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#4A6FA5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Mi Panel'}
                </p>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {greeting}, <span style={{ color: '#F0B429' }}>{user?.name?.split(' ')[0]}</span>
                </h1>
            </div>

            {/* Stats ADMIN */}
            {user?.role === 'ADMIN' && metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0', marginBottom: '2.5rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {([
                        { label: 'Usuarios',    value: metrics.totalUsers,          accent: '#60A5FA', Icon: Icons.Users },
                        { label: 'Abogados',    value: metrics.totalLawyers,        accent: '#F0B429', Icon: Icons.Scale },
                        { label: 'Clientes',    value: metrics.totalClients,        accent: '#34D399', Icon: Icons.User },
                        { label: 'Citas',       value: metrics.totalAppointments,   accent: '#A78BFA', Icon: Icons.Calendar },
                        { label: 'Pendientes',  value: metrics.pendingAppointments, accent: '#FBBF24', Icon: Icons.Clock },
                        { label: 'Servicios',   value: metrics.totalServices,       accent: '#22D3EE', Icon: Icons.Briefcase },
                    ] as const).map((m, i, arr) => (
                        <div key={m.label} style={{ padding: '1.4rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRight: i < arr.length-1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{m.label}</span>
                                <span style={{ color: m.accent }}><m.Icon /></span>
                            </div>
                            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#F1F5F9', lineHeight: 1 }}>{m.value}</div>
                            <div style={{ marginTop: '0.6rem', height: '2px', borderRadius: 9999, background: m.accent, opacity: 0.4 }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Stats CLIENTE */}
            {user?.role !== 'ADMIN' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0', marginBottom: '2.5rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {([
                        { label: 'Total Citas',  value: appointments.length, accent: '#60A5FA', Icon: Icons.Calendar },
                        { label: 'Pendientes',   value: pending,             accent: '#FBBF24', Icon: Icons.Clock },
                        { label: 'Confirmadas',  value: confirmed,           accent: '#34D399', Icon: Icons.Check },
                    ] as const).map((m, i) => (
                        <div key={m.label} style={{ padding: '1.4rem 1.4rem', background: 'rgba(255,255,255,0.03)', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{m.label}</span>
                                <span style={{ color: m.accent }}><m.Icon /></span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F1F5F9', lineHeight: 1 }}>{m.value}</div>
                            <div style={{ marginTop: '0.6rem', height: '2px', borderRadius: 9999, background: m.accent, opacity: 0.4 }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Acciones Rápidas */}
            <div style={{ marginBottom: '2.5rem' }}>
                <Label>Acciones Rápidas</Label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {user?.role === 'CLIENTE' && <>
                        <Btn href="/dashboard/buscar-abogados" primary icon={<Icons.Search />}>Buscar Abogado</Btn>
                        <Btn href="/dashboard/citas" icon={<Icons.Calendar />}>Mis Citas</Btn>
                        <Btn href="/dashboard/chat" icon={<Icons.Message />}>Mensajes</Btn>
                    </>}
                    {user?.role === 'ADMIN' && <>
                        <Btn href="/dashboard/admin/usuarios" primary icon={<Icons.Users />}>Usuarios</Btn>
                        <Btn href="/dashboard/admin/verificaciones" icon={<Icons.Shield />}>Verificaciones</Btn>
                        <Btn href="/dashboard/admin/citas" icon={<Icons.Calendar />}>Citas</Btn>
                        <Btn href="/dashboard/admin/servicios" icon={<Icons.Briefcase />}>Servicios</Btn>
                    </>}
                </div>
            </div>

            {/* Casos Activos CLIENTE */}
            {user?.role === 'CLIENTE' && activeCases.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Label>Mis Casos Activos</Label>
                        <Link href="/dashboard/mis-casos" style={{ fontSize: '0.8rem', color: '#F0B429', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Ver todos <Icons.Arrow />
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {activeCases.slice(0, 3).map((c: any, i, arr) => {
                            const steps = ['SOLICITUD','PRESUPUESTO_ENVIADO','PRESUPUESTO_APROBADO','CONTRATO_FIRMADO','EN_CURSO','CERRADO'];
                            const pct = Math.round(((steps.indexOf(c.status) + 1) / steps.length) * 100);
                            const st = CASE_ST[c.status] || { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: c.status };
                            return (
                                <Link key={c.id} href={`/dashboard/mis-casos/${c.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ padding: '1.1rem 0', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                            <div>
                                                <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.9rem' }}>{c.title}</span>
                                                <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{c.caseNumber} · {c.legalArea}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: st.color }}>{st.label}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: st.color, borderRadius: 9999, opacity: 0.8 }} />
                                            </div>
                                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{pct}%</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Últimas Citas */}
            <div>
                <Label>{user?.role === 'ADMIN' ? 'Últimas Citas' : 'Mis Últimas Citas'}</Label>
                {appointments.length === 0 ? (
                    <div style={{ padding: '2.5rem 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem', marginBottom: '1rem' }}>No hay citas registradas aún.</p>
                        {user?.role === 'CLIENTE' && (
                            <Link href="/dashboard/buscar-abogados" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#F0B429', color: '#F1F5F9', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                                <Icons.Search /> Buscar abogado
                            </Link>
                        )}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                {user?.role === 'ADMIN' && <Th>Cliente</Th>}
                                {(user?.role === 'ADMIN' || user?.role === 'CLIENTE') && <Th>Abogado</Th>}
                                <Th>Servicio</Th><Th>Fecha</Th><Th>Estado</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.slice(0, 5).map((a) => (
                                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                    {user?.role === 'ADMIN' && <Td bold>{a.client?.name || '—'}</Td>}
                                    {(user?.role === 'ADMIN' || user?.role === 'CLIENTE') && (
                                        <Td>{a.lawyer?.name || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Sin asignar</span>}</Td>
                                    )}
                                    <Td>{a.service?.name || '—'}</Td>
                                    <Td muted>{a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Td>
                                    <Td>
                                        {(() => {
                                            const s = STATUS[a.status] || { label: a.status, color: '#94A3B8', dot: '#94A3B8' };
                                            return (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: s.color }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                                                    {s.label}
                                                </span>
                                            );
                                        })()}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {appointments.length > 5 && (
                    <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Link href={user?.role === 'ADMIN' ? '/dashboard/admin/citas' : '/dashboard/citas'}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#F0B429', fontWeight: 600, textDecoration: 'none' }}>
                            Ver todas las citas <Icons.Arrow />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.85rem' }}>{children}</p>;
}

function Btn({ href, children, primary, icon }: { href: string; children: React.ReactNode; primary?: boolean; icon?: React.ReactNode }) {
    return (
        <Link href={href} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.1rem', borderRadius: '0.55rem',
            fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
            ...(primary
                ? { background: '#F0B429', color: '#0C2340' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.09)' }),
        }}>
            {icon}{children}
        </Link>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.09em', whiteSpace: 'nowrap' }}>{children}</th>;
}

function Td({ children, bold, muted }: { children: React.ReactNode; bold?: boolean; muted?: boolean }) {
    return <td style={{ padding: '0.85rem 0.75rem', color: bold ? '#F1F5F9' : muted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.65)', fontWeight: bold ? 600 : 400, fontSize: '0.875rem' }}>{children}</td>;
}
