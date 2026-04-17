import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(180deg, #1E4668, #183A58)',
            color: 'rgba(255,255,255,0.8)',
            padding: '3rem 1rem 1.5rem',
            borderTop: '1px solid rgba(232,140,42,0.15)',
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-white)' }}>
                                Bufete<span style={{ color: 'var(--color-gold)' }}>Legal</span>
                            </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }}>
                            Soluciones jurídicas con excelencia profesional. Más de 20 años protegiendo los derechos de nuestros clientes.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Navegación
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>Inicio</Link>
                            <Link href="/abogados" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>Nuestros Abogados</Link>
                            <Link href="/#servicios" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>Servicios</Link>
                            <Link href="/#testimonios" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>Testimonios</Link>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Servicios
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Consulta Legal</span>
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Representación en Juicio</span>
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Redacción de Contratos</span>
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Asesoría Empresarial</span>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Contacto
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            <span>📍 Av. Francisco de Miranda, Caracas</span>
                            <span>📞 +58 212-000-0000</span>
                            <span>📧 contacto@bufetelegal.com</span>
                            <span>🕐 Lun - Vie: 8:00 AM - 6:00 PM</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

                {/* Bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                        © {new Date().getFullYear()} BufeteLegal. Todos los derechos reservados.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="#" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>Política de Privacidad</Link>
                        <Link href="#" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>Términos de Uso</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
