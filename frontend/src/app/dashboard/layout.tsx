'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { apiFetch } from '@/lib/api';
import { useGlobalSocket } from '@/contexts/SocketContext';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const { unreadCount, clearUnread } = useGlobalSocket();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [checkingVerification, setCheckingVerification] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Check verification status for lawyers (with polling every 10s)
    useEffect(() => {
        if (user?.role === 'ABOGADO') {
            const checkStatus = () => {
                apiFetch('/verification/me')
                    .then(data => setVerificationStatus(data.verificationStatus || 'NONE'))
                    .catch(() => setVerificationStatus('NONE'))
                    .finally(() => setCheckingVerification(false));
            };
            checkStatus();
            const interval = setInterval(checkStatus, 10000);
            return () => clearInterval(interval);
        } else {
            setCheckingVerification(false);
        }
    }, [user]);

    // Redirect lawyers without verification to the form
    useEffect(() => {
        if (
            user?.role === 'ABOGADO' &&
            !checkingVerification &&
            verificationStatus === 'NONE' &&
            pathname !== '/dashboard/verificacion'
        ) {
            router.push('/dashboard/verificacion');
        }
    }, [user, checkingVerification, verificationStatus, pathname, router]);

    // Clear unread messages when on chat page
    useEffect(() => {
        if (pathname === '/dashboard/chat') {
            clearUnread();
        }
    }, [pathname, clearUnread]);

    if (loading || checkingVerification) return <div style={{ padding: '4rem' }}><div className="spinner" /></div>;
    if (!user) return null;

    const menuItems = (() => {
        switch (user.role) {
            case 'ADMIN':
                return [
                    { href: '/dashboard/admin/usuarios', label: '👥 Usuarios' },
                    { href: '/dashboard/admin/abogados', label: '⚖️ Abogados' },
                    { href: '/dashboard/admin/verificaciones', label: '🛡️ Solicitudes' },
                    { href: '/dashboard/admin/servicios', label: '📋 Servicios' },
                    { href: '/dashboard/admin/testimonios', label: '💬 Testimonios' },
                    { href: '/dashboard/admin/citas', label: '📅 Citas' },
                    { href: '/dashboard/chat', label: '💬 Mensajes' },
                    { href: '/dashboard/admin/citas', label: '📆 Calendario' },
                ];
            case 'ABOGADO':
                return [
                    { href: '/dashboard/mis-citas', label: '📅 Mis Citas' },
                    { href: '/dashboard/mi-perfil', label: '👤 Mi Perfil' },
                    { href: '/dashboard/chat', label: '💬 Mensajes' },
                    { href: '/dashboard/mis-citas?view=calendar', label: '📆 Calendario' },
                ];
            case 'CLIENTE':
            default:
                return [
                    { href: '/dashboard/citas', label: '📅 Mis Citas' },
                    { href: '/dashboard/perfil', label: '👤 Mi Perfil' },
                    { href: '/dashboard/chat', label: '💬 Mensajes' },
                    { href: '/dashboard/citas?view=calendar', label: '📆 Calendario' },
                    { href: '/para-abogados', label: '🔍 Buscar Abogados' },
                ];
        }
    })();

    return (
        <div className="dashboard-layout">
            {/* Mobile top bar */}
            <div className="dashboard-topbar">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Menú"
                    style={{
                        background: 'none', border: 'none', color: 'var(--color-white)',
                        fontSize: '1.4rem', cursor: 'pointer', padding: '0.25rem',
                    }}
                >
                    {sidebarOpen ? '✕' : '☰'}
                </button>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-white)' }}>
                    Panel de Control
                </span>
                <span style={{
                    background: 'rgba(212,168,71,0.2)', color: 'var(--color-gold)',
                    padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.65rem', fontWeight: 600,
                }}>
                    {user.role}
                </span>
            </div>

            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="dashboard-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                        Panel de Control
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user.name}</div>
                    <span style={{
                        display: 'inline-block',
                        background: 'rgba(212,168,71,0.2)',
                        color: 'var(--color-gold)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        marginTop: '0.25rem',
                    }}>
                        {user.role}
                    </span>
                    {user.role === 'ABOGADO' && verificationStatus && (
                        <div style={{
                            marginTop: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem',
                            background: verificationStatus === 'APPROVED' ? 'rgba(16,185,129,0.2)' : verificationStatus === 'PENDING' ? 'rgba(251,191,36,0.2)' : verificationStatus === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(156,163,175,0.2)',
                            color: verificationStatus === 'APPROVED' ? '#10B981' : verificationStatus === 'PENDING' ? '#FFC107' : verificationStatus === 'REJECTED' ? '#F87171' : '#9CA3AF',
                        }}>
                            {verificationStatus === 'APPROVED' ? '✅ Verificado' :
                                verificationStatus === 'PENDING' ? '⏳ Verificación pendiente' :
                                    verificationStatus === 'REJECTED' ? '❌ Verificación rechazada' :
                                        '📋 Verificación requerida'}
                        </div>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
                    {menuItems.map((item, idx) => {
                        const [itemPath, itemQuery] = item.href.split('?');
                        const hasViewParam = itemQuery?.includes('view=calendar');
                        const currentView = searchParams.get('view');

                        let isActive;
                        if (hasViewParam) {
                            isActive = pathname === itemPath && currentView === 'calendar';
                        } else if (item.label.includes('Citas')) {
                            isActive = (pathname === itemPath || pathname.startsWith(itemPath + '/')) && currentView !== 'calendar';
                        } else {
                            isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        }
                        return (
                            <Link
                                key={item.href + idx}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--color-white)' : 'rgba(255,255,255,0.7)',
                                    background: isActive ? 'rgba(212,168,71,0.2)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--color-gold)' : '3px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {item.label}
                                {item.href === '/dashboard/chat' && unreadCount > 0 && (
                                    <span style={{
                                        background: 'var(--color-danger)',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        marginLeft: 'auto',
                                        fontWeight: 700,
                                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                                    }}>
                                        {unreadCount > 9 ? '+9' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link href="/" style={{ display: 'block', padding: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                        ← Volver al sitio
                    </Link>
                    <button onClick={logout} style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.6)',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                    }}>
                        🚪 Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="dashboard-content">
                {user.role === 'ABOGADO' && verificationStatus === 'PENDING' && pathname !== '/dashboard/verificacion' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.95)', borderRadius: '1.25rem', padding: '2rem 1.5rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: '500px', width: '100%',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                            <h1 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                Esperando Verificación
                            </h1>
                            <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                Tu formulario de verificación ha sido enviado exitosamente.
                                Un administrador lo revisará pronto.
                            </p>
                        </div>
                    </div>
                ) : user.role === 'ABOGADO' && verificationStatus === 'REJECTED' && pathname !== '/dashboard/verificacion' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.95)', borderRadius: '1.25rem', padding: '2rem 1.5rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: '500px', width: '100%',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                            <h1 style={{ fontSize: '1.25rem', color: '#991B1B', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                Verificación Rechazada
                            </h1>
                            <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                Tu solicitud fue rechazada. Puedes enviar una nueva solicitud.
                            </p>
                            <a href="/dashboard/verificacion" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', textDecoration: 'none' }}>
                                📝 Enviar Nueva Solicitud
                            </a>
                        </div>
                    </div>
                ) : user.role === 'ABOGADO' && verificationStatus === 'APPROVED' && pathname === '/dashboard' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.95)', borderRadius: '1.25rem', padding: '2rem 1.5rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: '550px', width: '100%',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h1 style={{ fontSize: '1.25rem', color: '#065F46', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                ¡Perfil Verificado!
                            </h1>
                            <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                Tu solicitud ha sido aprobada. Completa tu perfil profesional para que los clientes te encuentren.
                            </p>
                            <a href="/dashboard/mi-perfil" className="btn btn-primary" style={{ padding: '0.75rem 2rem', textDecoration: 'none', fontSize: '1rem' }}>
                                👤 Completar Mi Perfil
                            </a>
                        </div>
                    </div>
                ) : (
                    children
                )}
            </div>

            <style jsx>{`
                .dashboard-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg);
                }
                .dashboard-topbar {
                    display: none;
                }
                .dashboard-sidebar {
                    width: 260px;
                    background: var(--color-primary-dark);
                    color: var(--color-white);
                    padding: 1.5rem 0;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                }
                .dashboard-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-x: auto;
                    min-width: 0;
                }
                .dashboard-overlay {
                    display: none;
                }

                @media (max-width: 768px) {
                    .dashboard-layout {
                        flex-direction: column;
                    }
                    .dashboard-topbar {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0.75rem 1rem;
                        background: var(--color-primary-dark);
                        position: sticky;
                        top: 0;
                        z-index: 1001;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                    .dashboard-sidebar {
                        position: fixed;
                        top: 0;
                        left: -280px;
                        width: 280px;
                        height: 100vh;
                        z-index: 1002;
                        transition: left 0.3s ease;
                        overflow-y: auto;
                        padding-top: 1.5rem;
                    }
                    .dashboard-sidebar.open {
                        left: 0;
                    }
                    .dashboard-overlay {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 1001;
                    }
                    .dashboard-content {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div style={{ padding: '4rem' }}><div className="spinner" /></div>}>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </Suspense>
    );
}
