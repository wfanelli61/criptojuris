'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Scroll-based transparency
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getDashboardLink = () => {
        if (!user) return '/login';
        return '/dashboard';
    };

    return (
        <nav style={{
            position: 'fixed',
            top: scrolled ? 0 : '36px',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: scrolled ? 'rgba(30, 70, 104, 0.95)' : 'rgba(36, 84, 122, 0.3)',
            backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px)',
            WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px)',
            borderBottom: scrolled ? '1px solid rgba(232, 140, 42, 0.25)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.25)' : 'none',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} aria-label="Inicio">
                    <div style={{
                        width: '38px', height: '38px',
                        background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 12px rgba(240,180,41,0.4)',
                        flexShrink: 0,
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L12 4" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M5 4H19" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 4L12 20" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M5 4L2 10C2 10 2 13 5.5 13C9 13 9 10 9 10L6 4" stroke="#0C2340" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 4L16 10C16 10 16 13 19.5 13C23 13 23 10 23 10L20 4" stroke="#0C2340" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 20H15" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            color: 'var(--color-white)',
                            letterSpacing: '-0.03em',
                        }}>
                            Bufete<span style={{ color: 'var(--color-gold)' }}>Legal</span>
                        </span>
                        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                            Venezuela
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-desktop nav-links-desktop">
                    {[
                        { href: '/#servicios', label: 'Servicios' },
                        { href: '/blog', label: 'Blog' },
                        { href: '/abogados', label: 'Abogados' },
                        { href: '/#testimonios', label: 'Testimonios' },
                        { href: '/#nosotros', label: 'Nosotros' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-lg)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-gold)';
                                e.currentTarget.style.background = 'rgba(240,180,41,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.75rem' }} />

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Link href={getDashboardLink()} className="btn btn-outline-gold btn-sm">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="btn btn-sm" style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: 'var(--color-white)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}>
                                Salir
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Link href="/login" className="btn btn-sm" style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: 'var(--color-white)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}>
                                Ingresar
                            </Link>
                            <Link href="/registro" className="btn btn-primary btn-sm">
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menú de navegación"
                    aria-expanded={menuOpen}
                    style={{
                        display: 'none',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'var(--color-white)',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        padding: 0,
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all 0.3s ease',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    className="nav-hamburger"
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div style={{
                    background: 'rgba(6, 15, 29, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    animation: 'fadeInUp 0.3s ease forwards',
                }} className="nav-mobile">
                    {[
                        { href: '/#servicios', label: 'Servicios' },
                        { href: '/blog', label: 'Blog' },
                        { href: '/abogados', label: 'Abogados' },
                        { href: '/#testimonios', label: 'Testimonios' },
                        { href: '/#nosotros', label: 'Nosotros' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                color: 'rgba(255,255,255,0.85)',
                                padding: '0.75rem 1rem',
                                fontSize: '0.95rem',
                                borderRadius: 'var(--radius-md)',
                                transition: 'background 0.2s ease',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
                    {user ? (
                        <>
                            <Link href={getDashboardLink()} onClick={() => setMenuOpen(false)} className="btn btn-primary btn-sm">Dashboard</Link>
                            <button onClick={() => { logout(); setMenuOpen(false); }} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-white)' }}>Salir</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-white)', border: '1px solid rgba(255,255,255,0.15)' }}>Ingresar</Link>
                            <Link href="/registro" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-sm">Registrarse</Link>
                        </>
                    )}
                </div>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .nav-desktop { display: none !important; }
                    .nav-hamburger { display: block !important; }
                }
            `}</style>
        </nav>
    );
}
