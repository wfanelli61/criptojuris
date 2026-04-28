'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { apiFetch } from '@/lib/api';
import { useGlobalSocket } from '@/contexts/SocketContext';
import AIAssistant from '@/components/AIAssistant';

/* ── SVG Icon System ── */
const Icon = ({ name, size = 18, stroke = 'currentColor' }: { name: string; size?: number; stroke?: string }) => {
    const paths: Record<string, React.ReactNode> = {
        home:     <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
        calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
        clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
        user:     <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
        users:    <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
        scale:    <><path d="M12 2L12 5"/><path d="M3 5h18"/><path d="M5 5L2 11c0 0 0 3 3.5 3S9 11 9 11L6 5"/><path d="M19 5L16 11c0 0 0 3 3.5 3S23 11 23 11L20 5"/><path d="M9 19h6"/><path d="M12 5v14"/></>,
        shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
        list:     <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
        star:     <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
        message:  <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
        search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
        globe:    <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>,
        logout:   <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
        check:    <><polyline points="20 6 9 17 4 12"/></>,
        x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
        menu:     <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
        bell:     <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
        briefcase:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></>,
        trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
        folder:   <><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></>,
        book:     <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
        headphones:<><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></>,
        creditcard:<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
        barchart:  <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {paths[name] ?? null}
        </svg>
    );
};

/* ── Nav item type ── */
interface NavItem { href: string; label: string; icon: string; group: string; }

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const { unreadCount, clearUnread, notifications, notifUnread, markNotifRead, markAllRead } = useGlobalSocket();
    const [notifOpen, setNotifOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [checkingVerification, setCheckingVerification] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    useEffect(() => {
        if (user?.role === 'ABOGADO') {
            const check = () => apiFetch('/verification/me')
                .then(d => setVerificationStatus(d.verificationStatus || 'NONE'))
                .catch(() => setVerificationStatus('NONE'))
                .finally(() => setCheckingVerification(false));
            check();
            const t = setInterval(check, 5 * 60 * 1000); // cada 5 min, no 10 segundos
            return () => clearInterval(t);
        } else { setCheckingVerification(false); }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'ABOGADO' && !checkingVerification && verificationStatus === 'NONE' && pathname !== '/dashboard/verificacion')
            router.push('/dashboard/verificacion');
    }, [user, checkingVerification, verificationStatus, pathname, router]);

    useEffect(() => { if (pathname === '/dashboard/chat') clearUnread(); }, [pathname, clearUnread]);

    if (loading || checkingVerification) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a1929' }}>
            <div className="spinner" />
        </div>
    );
    if (!user) return null;

    const menuItems: NavItem[] = (() => {
        switch (user.role) {
            case 'ADMIN': return [
                { href: '/dashboard', label: 'Inicio', icon: 'home', group: 'general' },
                { href: '/dashboard/admin/usuarios', label: 'Usuarios', icon: 'users', group: 'gestion' },
                { href: '/dashboard/admin/abogados', label: 'Abogados', icon: 'scale', group: 'gestion' },
                { href: '/dashboard/admin/verificaciones', label: 'Verificaciones', icon: 'shield', group: 'gestion' },
                { href: '/dashboard/admin/servicios', label: 'Servicios', icon: 'briefcase', group: 'contenido' },
                { href: '/dashboard/admin/testimonios', label: 'Testimonios', icon: 'star', group: 'contenido' },
                { href: '/dashboard/admin/citas', label: 'Citas', icon: 'calendar', group: 'contenido' },
                { href: '/dashboard/admin/casos', label: 'Expedientes', icon: 'folder', group: 'contenido' },
                { href: '/dashboard/admin/normas', label: 'Normas Jurídicas', icon: 'book', group: 'contenido' },
                { href: '/dashboard/admin/planes', label: 'Planes', icon: 'creditcard', group: 'contenido' },
                { href: '/dashboard/admin/reportes', label: 'Reportes', icon: 'barchart', group: 'contenido' },
                { href: '/dashboard/analisis-ia', label: 'Análisis con IA', icon: 'shield', group: 'ia' },
                { href: '/dashboard/generar-documento', label: 'Generar Documento', icon: 'book', group: 'ia' },
                { href: '/dashboard/chat', label: 'Mensajes', icon: 'message', group: 'comunicacion' },
                { href: '/dashboard/soporte', label: 'Soporte', icon: 'headphones', group: 'comunicacion' },
            ];
            case 'ABOGADO': return [
                { href: '/dashboard', label: 'Inicio', icon: 'home', group: 'general' },
                { href: '/dashboard/casos', label: 'Expedientes', icon: 'folder', group: 'trabajo' },
                { href: '/dashboard/mis-citas', label: 'Mis Citas', icon: 'calendar', group: 'trabajo' },
                { href: '/dashboard/mis-citas?view=calendar', label: 'Calendario', icon: 'clock', group: 'trabajo' },
                { href: '/dashboard/disponibilidad', label: 'Mi Disponibilidad', icon: 'clock', group: 'trabajo' },
                { href: '/dashboard/normas', label: 'Normas Jurídicas', icon: 'book', group: 'trabajo' },
                { href: '/dashboard/blog', label: 'Mis Artículos', icon: 'list', group: 'contenido' },
                { href: '/dashboard/suscripcion', label: 'Mi Suscripción', icon: 'creditcard', group: 'contenido' },
                { href: '/dashboard/mi-perfil', label: 'Mi Perfil', icon: 'user', group: 'cuenta' },
                { href: '/dashboard/chat', label: 'Mensajes', icon: 'message', group: 'cuenta' },
                { href: '/dashboard/soporte', label: 'Soporte', icon: 'headphones', group: 'cuenta' },
            ];
            default: return [
                { href: '/dashboard', label: 'Inicio', icon: 'home', group: 'general' },
                { href: '/dashboard/metricas', label: 'Mi Dashboard', icon: 'trending', group: 'general' },
                { href: '/dashboard/mis-casos', label: 'Mis Casos', icon: 'folder', group: 'actividad' },
                { href: '/dashboard/citas', label: 'Mis Citas', icon: 'calendar', group: 'actividad' },
                { href: '/dashboard/citas?view=calendar', label: 'Calendario', icon: 'clock', group: 'actividad' },
                { href: '/dashboard/buscar-abogados', label: 'Buscar Abogados', icon: 'search', group: 'actividad' },
                { href: '/dashboard/analisis-ia', label: 'Análisis con IA', icon: 'shield', group: 'ia' },
                { href: '/dashboard/generar-documento', label: 'Generar Documento', icon: 'book', group: 'ia' },
                { href: '/dashboard/perfil', label: 'Mi Perfil', icon: 'user', group: 'cuenta' },
                { href: '/dashboard/chat', label: 'Mensajes', icon: 'message', group: 'cuenta' },
                { href: '/dashboard/soporte', label: 'Soporte', icon: 'headphones', group: 'cuenta' },
            ];
        }
    })();

    const groupLabels: Record<string, string> = {
        general: '', gestion: 'Gestión', contenido: 'Contenido',
        comunicacion: 'Comunicación', trabajo: 'Mi Trabajo',
        actividad: 'Actividad', ia: 'Inteligencia Artificial', cuenta: 'Mi Cuenta', suscripcion: 'Suscripción',
    };

    const roleLabel: Record<string, string> = { ADMIN: 'Administrador', ABOGADO: 'Abogado', CLIENTE: 'Cliente' };
    const roleColor: Record<string, string> = { ADMIN: '#F0B429', ABOGADO: '#10B981', CLIENTE: '#3B82F6' };
    const initials = user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

    const isActive = (item: NavItem) => {
        const [itemPath, itemQuery] = item.href.split('?');
        const hasViewParam = itemQuery?.includes('view=calendar');
        const currentView = searchParams.get('view');
        if (hasViewParam) return pathname === itemPath && currentView === 'calendar';
        if (item.label === 'Inicio') return pathname === '/dashboard';
        if (item.label === 'Mis Citas' || item.label === 'Citas') return (pathname === itemPath || pathname.startsWith(itemPath + '/')) && currentView !== 'calendar';
        return pathname === item.href || pathname.startsWith(item.href + '/');
    };

    /* Verification state screen */
    const VerificationScreen = ({ type }: { type: 'pending' | 'rejected' | 'approved' }) => {
        const config = {
            pending: {
                icon: 'clock', iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)',
                title: 'Verificación en proceso',
                desc: 'Tu solicitud fue recibida. Un administrador la revisará en las próximas 24-48 horas.',
                action: null,
            },
            rejected: {
                icon: 'x', iconColor: '#EF4444', iconBg: 'rgba(239,68,68,0.1)',
                title: 'Verificación rechazada',
                desc: 'Tu solicitud no fue aprobada. Puedes enviar una nueva con la información corregida.',
                action: { href: '/dashboard/verificacion', label: 'Enviar nueva solicitud' },
            },
            approved: {
                icon: 'check', iconColor: '#10B981', iconBg: 'rgba(16,185,129,0.1)',
                title: '¡Perfil verificado!',
                desc: 'Ya puedes completar tu perfil profesional para que los clientes te encuentren en el directorio.',
                action: { href: '/dashboard/mi-perfil', label: 'Completar mi perfil' },
            },
        }[type];

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: config.iconBg,
                        border: `1px solid ${config.iconColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <Icon name={config.icon} size={28} stroke={config.iconColor} />
                    </div>
                    <h2 style={{ fontSize: '1.35rem', color: '#F1F5F9', fontFamily: 'var(--font-heading)', marginBottom: '0.65rem' }}>
                        {config.title}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: config.action ? '1.75rem' : 0 }}>
                        {config.desc}
                    </p>
                    {config.action && (
                        <a href={config.action.href} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.7rem 1.75rem', background: '#F0B429', color: '#F1F5F9',
                            borderRadius: '0.65rem', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                        }}>
                            {config.action.label}
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-layout">
            {/* ── Mobile topbar ── */}
            <div className="dashboard-topbar">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menú" style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', cursor: 'pointer', padding: 0,
                    width: '44px', height: '44px',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Icon name={sidebarOpen ? 'x' : 'menu'} size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, color: '#F1F5F9',
                    }}>{initials}</div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Panel de Control</span>
                </div>
                <span style={{
                    background: `${roleColor[user.role]}20`, color: roleColor[user.role],
                    padding: '0.2rem 0.6rem', borderRadius: '9999px',
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
                }}>
                    {roleLabel[user.role]}
                </span>
            </div>

            {/* ── Sidebar overlay (mobile) ── */}
            {sidebarOpen && <div className="dashboard-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* ── Sidebar ── */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>

                {/* Logo */}
                <div style={{ padding: '1.5rem 1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '9px',
                            background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Icon name="scale" size={18} stroke="#0C2340" />
                        </div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                            Bufete<span style={{ color: '#F0B429' }}>Legal</span>
                        </span>
                    </div>
                </div>

                {/* User profile */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #1B4D8F, #0C2340)',
                            border: `2px solid ${roleColor[user.role]}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 800, color: roleColor[user.role],
                        }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                                <span style={{
                                    background: `${roleColor[user.role]}20`, color: roleColor[user.role],
                                    padding: '0.1rem 0.5rem', borderRadius: '9999px',
                                    fontSize: '0.62rem', fontWeight: 700,
                                }}>{roleLabel[user.role]}</span>
                                {user.role === 'ABOGADO' && verificationStatus === 'APPROVED' && (
                                    <span style={{
                                        background: 'rgba(16,185,129,0.15)', color: '#10B981',
                                        padding: '0.1rem 0.4rem', borderRadius: '9999px',
                                        fontSize: '0.58rem', fontWeight: 700,
                                    }}>Verificado</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {user.role === 'ABOGADO' && verificationStatus && verificationStatus !== 'APPROVED' && (
                        <div style={{
                            marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.72rem',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: verificationStatus === 'PENDING' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: verificationStatus === 'PENDING' ? '#F59E0B' : '#EF4444',
                            border: `1px solid ${verificationStatus === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                            <Icon name={verificationStatus === 'PENDING' ? 'clock' : 'x'} size={12} />
                            {verificationStatus === 'PENDING' ? 'Verificación pendiente' : 'Verificación rechazada'}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0.75rem 0.75rem', overflowY: 'auto' }}>
                    {menuItems.map((item, idx) => {
                        const active = isActive(item);
                        const prevItem = menuItems[idx - 1];
                        const isNewGroup = idx > 0 && prevItem.group !== item.group;
                        const gLabel = groupLabels[item.group];
                        const isChat = item.icon === 'message';

                        return (
                            <div key={item.href + idx}>
                                {isNewGroup && (
                                    <div style={{ padding: '1rem 0.75rem 0.4rem' }}>
                                        {gLabel && (
                                            <span style={{
                                                fontSize: '0.58rem', fontWeight: 700,
                                                color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em',
                                            }}>{gLabel}</span>
                                        )}
                                    </div>
                                )}
                                <Link href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.65rem 0.75rem', borderRadius: '10px', marginBottom: '2px',
                                    fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                                    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                                    background: active ? 'rgba(240,180,41,0.14)' : 'transparent',
                                    transition: 'all 0.15s ease', textDecoration: 'none',
                                    position: 'relative',
                                }}
                                    onMouseEnter={(e: any) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                                    onMouseLeave={(e: any) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
                                >
                                    {/* Active indicator */}
                                    {active && (
                                        <div style={{
                                            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                            width: '3px', height: '60%', background: '#F0B429', borderRadius: '0 3px 3px 0',
                                        }} />
                                    )}
                                    <span style={{ color: active ? '#F0B429' : 'inherit', display: 'flex' }}>
                                        <Icon name={item.icon} size={17} />
                                    </span>
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {isChat && unreadCount > 0 && (
                                        <span style={{
                                            background: '#EF4444', color: '#fff',
                                            fontSize: '0.6rem', padding: '2px 6px', borderRadius: '9999px',
                                            fontWeight: 700, lineHeight: 1,
                                        }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* ── Notificaciones ── */}
                <div style={{ padding: '0 0.75rem 0.5rem', position: 'relative' }}>
                    <button
                        onClick={() => { setNotifOpen(o => !o); if (!notifOpen && notifUnread > 0) markAllRead(); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                            padding: '0.65rem 0.75rem', borderRadius: '10px',
                            background: notifOpen ? 'rgba(240,180,41,0.14)' : 'transparent',
                            border: 'none', cursor: 'pointer', color: notifOpen ? '#fff' : 'rgba(255,255,255,0.55)',
                            fontSize: '0.875rem', fontWeight: notifOpen ? 600 : 400,
                            transition: 'all 0.15s', position: 'relative',
                        }}
                        onMouseEnter={e => { if (!notifOpen) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; } }}
                        onMouseLeave={e => { if (!notifOpen) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; } }}
                    >
                        {notifOpen && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', background: '#F0B429', borderRadius: '0 3px 3px 0' }} />}
                        <span style={{ color: notifOpen ? '#F0B429' : 'inherit', display: 'flex' }}>
                            <Icon name="bell" size={17} />
                        </span>
                        <span style={{ flex: 1, textAlign: 'left' }}>Notificaciones</span>
                        {notifUnread > 0 && (
                            <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '9999px', fontWeight: 700, lineHeight: 1 }}>
                                {notifUnread > 9 ? '9+' : notifUnread}
                            </span>
                        )}
                    </button>

                    {/* Panel desplegable */}
                    {notifOpen && (
                        <div style={{
                            position: 'absolute', bottom: '110%', left: '0.75rem', right: '0.75rem',
                            background: '#0D1A2D', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
                            maxHeight: '320px', overflowY: 'auto', zIndex: 200,
                        }}>
                            <div style={{ padding: '0.85rem 1rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Notificaciones</span>
                                {notifUnread > 0 && (
                                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.68rem', color: '#F0B429', fontWeight: 600 }}>
                                        Marcar todas leídas
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                                    Sin notificaciones
                                </div>
                            ) : notifications.map(n => {
                                const typeColor: Record<string, string> = { CASO: '#60A5FA', PRESUPUESTO: '#F0B429', CONTRATO: '#34D399', SOPORTE: '#C084FC', MENSAJE: '#22D3EE', SISTEMA: '#94A3B8' };
                                const dot = typeColor[n.type] || '#94A3B8';
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => { markNotifRead(n.id); if (n.link) window.location.href = n.link; setNotifOpen(false); }}
                                        style={{
                                            padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            cursor: 'pointer', display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                                            background: n.read ? 'transparent' : 'rgba(240,180,41,0.06)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(240,180,41,0.06)')}
                                    >
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 5 }} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: n.read ? 400 : 600, color: n.read ? 'rgba(255,255,255,0.55)' : '#fff', lineHeight: 1.3 }}>{n.title}</div>
                                            {n.body && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem', lineHeight: 1.4 }}>{n.body}</div>}
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.3rem' }}>
                                                {new Date(n.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0B429', flexShrink: 0, marginTop: '4px' }} />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={logout} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
                        padding: '0.6rem 0.75rem', borderRadius: '10px',
                        fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                    }}
                        onMouseEnter={(e: any) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                        onMouseLeave={(e: any) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Icon name="logout" size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <div className="dashboard-content">
                {user.role === 'ABOGADO' && verificationStatus === 'PENDING' && pathname !== '/dashboard/verificacion' ? (
                    <VerificationScreen type="pending" />
                ) : user.role === 'ABOGADO' && verificationStatus === 'REJECTED' && pathname !== '/dashboard/verificacion' ? (
                    <VerificationScreen type="rejected" />
                ) : (
                    children
                )}
            </div>

            {/* ── Asistente IA flotante ── */}
            <AIAssistant role={user.role} />

            <style jsx>{`
                .dashboard-layout { display: flex; min-height: 100vh; background: #0a1929; }
                .dashboard-topbar { display: none; }
                .dashboard-sidebar {
                    width: 248px; background: #060F1D; color: #fff;
                    flex-shrink: 0; display: flex; flex-direction: column;
                    position: sticky; top: 0; height: 100vh; overflow: hidden;
                }
                .dashboard-content { flex: 1; padding: 2rem; overflow-x: auto; min-width: 0; background: #0a1929; color: rgba(255,255,255,0.8); }
                .dashboard-overlay { display: none; }

                /* ══════════════════════════════════════════
                   DARK THEME — overrides globales completos
                   ══════════════════════════════════════════ */

                /* ── Tipografía ── */
                .dashboard-content h1,
                .dashboard-content h2,
                .dashboard-content h3,
                .dashboard-content h4 { color: #F1F5F9 !important; }

                /* ── Cards ── */
                .dashboard-content .card {
                    background: rgba(255,255,255,0.04) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    box-shadow: none !important;
                    color: rgba(255,255,255,0.8) !important;
                }
                .dashboard-content .card:hover {
                    transform: none !important;
                    border-color: rgba(240,180,41,0.3) !important;
                    box-shadow: 0 0 0 1px rgba(240,180,41,0.15), 0 8px 24px rgba(0,0,0,0.3) !important;
                }

                /* ── Botones primarios → dorado ── */
                .dashboard-content .btn-primary {
                    background: linear-gradient(135deg, #F0B429, #C68A0A) !important;
                    color: #0C2340 !important;
                    box-shadow: 0 4px 16px rgba(240,180,41,0.35) !important;
                    border: none !important;
                }
                .dashboard-content .btn-primary:hover {
                    background: linear-gradient(135deg, #F7D070, #F0B429) !important;
                    box-shadow: 0 6px 24px rgba(240,180,41,0.5) !important;
                    transform: translateY(-1px) !important;
                }
                .dashboard-content .btn-primary:disabled {
                    opacity: 0.5 !important;
                    transform: none !important;
                    box-shadow: none !important;
                }

                /* ── Botones secundarios → glass oscuro ── */
                .dashboard-content .btn-secondary {
                    background: rgba(255,255,255,0.06) !important;
                    color: rgba(255,255,255,0.7) !important;
                    border: 1px solid rgba(255,255,255,0.12) !important;
                    box-shadow: none !important;
                }
                .dashboard-content .btn-secondary:hover {
                    background: rgba(255,255,255,0.1) !important;
                    color: #fff !important;
                    border-color: rgba(255,255,255,0.2) !important;
                    transform: none !important;
                }

                /* ── Botones danger → glass rojo ── */
                .dashboard-content .btn-danger {
                    background: rgba(239,68,68,0.12) !important;
                    color: #F87171 !important;
                    border: 1px solid rgba(239,68,68,0.25) !important;
                    box-shadow: none !important;
                }
                .dashboard-content .btn-danger:hover {
                    background: rgba(239,68,68,0.2) !important;
                    box-shadow: 0 4px 16px rgba(239,68,68,0.2) !important;
                    transform: none !important;
                }

                /* ── Botones success → glass verde ── */
                .dashboard-content .btn-success {
                    background: rgba(16,185,129,0.12) !important;
                    color: #34D399 !important;
                    border: 1px solid rgba(16,185,129,0.25) !important;
                    box-shadow: none !important;
                }
                .dashboard-content .btn-success:hover {
                    background: rgba(16,185,129,0.2) !important;
                    box-shadow: 0 4px 16px rgba(16,185,129,0.2) !important;
                    transform: none !important;
                }

                /* ── Botones sm ── */
                .dashboard-content .btn-sm {
                    padding: 0.35rem 0.75rem !important;
                    font-size: 0.78rem !important;
                    border-radius: 0.5rem !important;
                }

                /* ── Formularios ── */
                .dashboard-content .form-label {
                    color: rgba(255,255,255,0.5) !important;
                    font-size: 0.8rem !important;
                    font-weight: 600 !important;
                }
                .dashboard-content input,
                .dashboard-content textarea,
                .dashboard-content select {
                    background: rgba(255,255,255,0.06) !important;
                    border-color: rgba(255,255,255,0.12) !important;
                    color: #F1F5F9 !important;
                    border-radius: 0.6rem !important;
                }
                .dashboard-content input::placeholder,
                .dashboard-content textarea::placeholder {
                    color: rgba(255,255,255,0.25) !important;
                }
                .dashboard-content input:focus,
                .dashboard-content textarea:focus,
                .dashboard-content select:focus {
                    border-color: rgba(240,180,41,0.5) !important;
                    outline: none !important;
                    box-shadow: 0 0 0 2px rgba(240,180,41,0.12) !important;
                }
                .dashboard-content option {
                    background: #0d2137 !important;
                    color: #F1F5F9 !important;
                }

                /* ── Tablas ── */
                .dashboard-content .table-container {
                    background: rgba(255,255,255,0.03) !important;
                    border: 1px solid rgba(255,255,255,0.07) !important;
                    border-radius: 1rem !important;
                }
                .dashboard-content .table th {
                    background: rgba(255,255,255,0.04) !important;
                    color: rgba(255,255,255,0.4) !important;
                    border-bottom: 1px solid rgba(255,255,255,0.07) !important;
                    font-size: 0.72rem !important;
                    letter-spacing: 0.08em !important;
                }
                .dashboard-content .table td {
                    color: rgba(255,255,255,0.75) !important;
                    border-bottom: 1px solid rgba(255,255,255,0.04) !important;
                }
                .dashboard-content .table tbody tr:hover td {
                    background: rgba(255,255,255,0.03) !important;
                }

                /* ── Badges ── */
                .dashboard-content .badge-pendiente  { background: rgba(251,191,36,0.15)  !important; color: #FBBF24 !important; }
                .dashboard-content .badge-confirmada { background: rgba(52,211,153,0.15)  !important; color: #34D399 !important; }
                .dashboard-content .badge-cancelada  { background: rgba(248,113,113,0.15) !important; color: #F87171 !important; }
                .dashboard-content .badge-finalizada { background: rgba(96,165,250,0.15)  !important; color: #60A5FA !important; }

                /* ── Acento dorado en bordes de focus y hover ── */
                .dashboard-content a:focus-visible,
                .dashboard-content button:focus-visible {
                    outline: 2px solid rgba(240,180,41,0.6) !important;
                    outline-offset: 2px !important;
                }

                @media (max-width: 768px) {
                    .dashboard-layout { flex-direction: column; }
                    .dashboard-topbar {
                        display: flex; align-items: center; justify-content: space-between;
                        padding: 0.75rem 1rem; background: #060F1D;
                        position: sticky; top: 0; z-index: 1001;
                        border-bottom: 1px solid rgba(255,255,255,0.08);
                    }
                    .dashboard-sidebar {
                        position: fixed; top: 0; left: -260px; width: 260px;
                        height: 100vh; z-index: 1002; transition: left 0.25s ease;
                        overflow-y: auto;
                    }
                    .dashboard-sidebar.open { left: 0; }
                    .dashboard-overlay {
                        display: block; position: fixed; inset: 0;
                        background: rgba(0,0,0,0.55); z-index: 1001;
                    }
                    .dashboard-content { padding: 1rem; }
                }
            `}</style>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a1929' }}>
                <div className="spinner" />
            </div>
        }>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </Suspense>
    );
}
