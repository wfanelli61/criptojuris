import Link from 'next/link';

const socialLinks = [
    {
        label: 'WhatsApp',
        href: 'https://wa.me/582120000000',
        color: '#25D366',
        svg: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        ),
    },
    {
        label: 'Instagram',
        href: 'https://instagram.com/bufetelegal',
        color: '#E1306C',
        svg: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
        ),
    },
    {
        label: 'LinkedIn',
        href: 'https://linkedin.com/company/bufetelegal',
        color: '#0077B5',
        svg: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    },
];

export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(180deg, #1A3D5C 0%, #122D44 100%)',
            color: 'rgba(255,255,255,0.8)',
            padding: '3.5rem 1rem 1.5rem',
            borderTop: '1px solid rgba(240,180,41,0.2)',
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

                    {/* Brand */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '34px', height: '34px',
                                background: 'linear-gradient(135deg, #C68A0A, #F0B429)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L12 4" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M5 4H19" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 4L12 20" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M5 4L2 10C2 10 2 13 5.5 13C9 13 9 10 9 10L6 4" stroke="#0C2340" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M19 4L16 10C16 10 16 13 19.5 13C23 13 23 10 23 10L20 4" stroke="#0C2340" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 20H15" stroke="#0C2340" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                                Bufete<span style={{ color: '#F0B429' }}>Legal</span>
                            </span>
                        </div>
                        <p style={{ fontSize: '0.83rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>
                            El marketplace legal #1 de Venezuela. Conectamos personas con abogados verificados de forma rápida, segura y transparente.
                        </p>

                        {/* Social links */}
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            {socialLinks.map(s => (
                                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                                    style={{
                                        width: '36px', height: '36px',
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'rgba(255,255,255,0.6)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e: any) => { e.currentTarget.style.color = s.color; e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = `${s.color}18`; }}
                                    onMouseLeave={(e: any) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                                >
                                    {s.svg}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navegación */}
                    <div>
                        <h4 style={{ color: '#F0B429', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Plataforma
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {[
                                { href: '/abogados', label: 'Directorio de Abogados' },
                                { href: '/para-abogados', label: 'Para Abogados' },
                                { href: '/#servicios', label: 'Servicios Legales' },
                                { href: '/#testimonios', label: 'Testimonios' },
                                { href: '/login', label: 'Iniciar Sesión' },
                                { href: '/registro', label: 'Crear Cuenta' },
                            ].map(l => (
                                <Link key={l.href} href={l.href} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', transition: 'color 0.2s' }}
                                    onMouseEnter={(e: any) => { e.currentTarget.style.color = '#F0B429'; }}
                                    onMouseLeave={(e: any) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                                >{l.label}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Áreas del derecho */}
                    <div>
                        <h4 style={{ color: '#F0B429', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Áreas del Derecho
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {['Derecho Penal', 'Derecho Civil', 'Derecho Laboral', 'Derecho Mercantil', 'Derecho de Familia', 'Derecho Tributario'].map(s => (
                                <span key={s} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)' }}>{s}</span>
                            ))}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 style={{ color: '#F0B429', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Contacto
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a href="https://wa.me/582120000000" target="_blank" rel="noopener noreferrer" style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                fontSize: '0.83rem', color: '#25D366', fontWeight: 600,
                                background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)',
                                padding: '0.5rem 0.85rem', borderRadius: '0.6rem',
                                textDecoration: 'none',
                            }}>
                                <span style={{ fontSize: '1rem' }}>💬</span> Chatea por WhatsApp
                            </a>
                            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <span>📍 Caracas, Venezuela</span>
                                <span>📧 contacto@bufetelegal.com</span>
                                <span>🕐 Lun – Vie: 8:00 AM – 6:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0' }} />

                {/* Bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                        © {new Date().getFullYear()} BufeteLegal Venezuela. Todos los derechos reservados.
                    </p>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                        <Link href="#" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Privacidad</Link>
                        <Link href="#" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Términos de Uso</Link>
                        <Link href="#" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
