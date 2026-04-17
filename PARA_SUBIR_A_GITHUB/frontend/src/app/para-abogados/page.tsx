'use client';

import Link from 'next/link';
import { useEffect } from 'react';

// Scroll reveal hook
function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
        );
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

export default function ParaAbogadosPage() {
    useScrollReveal();

    return (
        <>
            {/* ==================== HERO ==================== */}
            <section className="animated-gradient" style={{
                color: '#fff', padding: '10rem 1rem 5rem', position: 'relative', overflow: 'hidden',
                textAlign: 'center',
            }}>
                <div className="blob" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', background: 'radial-gradient(circle, rgba(240,180,41,0.15), transparent)' }} />
                <div className="blob" style={{ width: '350px', height: '350px', bottom: '-50px', right: '-50px', background: 'radial-gradient(circle, rgba(19,196,163,0.12), transparent)', animationDelay: '3s' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <div className="animate-fadeInUp">
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                            background: 'rgba(19,196,163,0.15)', border: '1px solid rgba(19,196,163,0.3)',
                            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)',
                            fontSize: '0.88rem', color: '#13C4A3', fontWeight: 600,
                            backdropFilter: 'blur(10px)', marginBottom: '2rem',
                        }}>
                            👨‍⚖️ Para profesionales del derecho
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                            fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
                        }}>
                            Haga crecer su práctica legal.
                            <br />
                            <span style={{
                                background: 'linear-gradient(135deg, #F7D070, #F0B429, #C68A0A)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                Los clientes vienen a usted.
                            </span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', maxWidth: '620px', margin: '0 auto 2.5rem' }}>
                            Únase a la plataforma legal #1 del país. Más de <strong style={{ color: '#fff' }}>10,000 personas</strong> buscan
                            abogados cada mes en nuestra plataforma. Cree su perfil profesional y empiece a recibir clientes hoy.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/registro" className="btn btn-primary btn-lg" style={{ fontSize: '1.05rem' }}>
                                Crear Perfil Gratis →
                            </Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                            {['🌐 Mayor Visibilidad', '📱 Contacto Directo', '📈 Gestión Eficiente'].map(t => (
                                <span key={t} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>✓ {t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== BENEFICIOS ==================== */}
            <section className="section" style={{ background: 'var(--color-white)' }}>
                <div className="container">
                    <h2 className="section-title reveal">¿Por qué unirse a BufeteLegal?</h2>
                    <p className="section-subtitle reveal">Lo que obtiene al registrarse como abogado en nuestra plataforma</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: '🎯', title: 'Clientes que lo buscan a usted', desc: 'No persiga clientes. Miles de personas buscan abogados en nuestra plataforma cada mes. Su perfil aparece cuando alguien necesita un especialista como usted.', color: '#F0B429' },
                            { icon: '📊', title: 'Estadísticas de su rendimiento', desc: 'Vea cuántas personas ven su perfil, cuántas le contactan, y qué especialidades son más demandadas. Tome decisiones basadas en datos reales.', color: '#13C4A3' },
                            { icon: '⭐', title: 'Reputación verificada', desc: 'Los clientes dejan reseñas después de cada consulta. Una buena calificación le genera más clientes automáticamente. Construya su reputación digital.', color: '#7C3AED' },
                            { icon: '📅', title: 'Control de su agenda', desc: 'Establezca sus horarios de disponibilidad, acepte o decline consultas, y organice sus citas desde un solo panel. Usted tiene el control total.', color: '#06B6D4' },
                            { icon: '🤖', title: 'Asistente IA incluido', desc: 'Nuestro asistente con inteligencia artificial ayuda a los clientes con consultas básicas y los dirige al abogado correcto. Usted recibe clientes mejor filtrados.', color: '#F43F5E' },
                            { icon: '🔒', title: 'Gestión Centralizada', desc: 'Todo en un solo lugar. Revise sus citas pendientes, comuníquese con los clientes a través del chat, y actualice su información en cualquier momento.', color: '#10B981' },
                        ].map((item, i) => (
                            <div key={item.title} className="card reveal" style={{
                                padding: '2rem', transitionDelay: `${i * 0.08}s`,
                                borderTop: `3px solid ${item.color}`,
                            }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '14px',
                                    background: `${item.color}12`, border: `1px solid ${item.color}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem', marginBottom: '1rem',
                                }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: 'var(--color-text-light)', lineHeight: 1.8, fontSize: '0.9rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIOS DE ABOGADOS ==================== */}
            <section className="section" style={{ background: 'var(--color-bg)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <h2 className="section-title reveal">Lo que dicen los abogados que ya están con nosotros</h2>
                    <p className="section-subtitle reveal">Profesionales reales compartiendo su experiencia en la plataforma</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { name: 'Dr. Alejandro Mora', role: 'Abogado Penalista', quote: 'Desde que me uní a la plataforma, mi nivel de exposición ha aumentado significativamente. Recibo un promedio de 12 consultas mensuales calificadas. Ha transformado mi práctica.', avatar: 'AM' },
                            { name: 'Dra. Isabella Castro', role: 'Abogada Laboralista', quote: 'Antes dependía solo de referidos. Ahora tengo un flujo constante de clientes que me encuentran directamente. Las herramientas del dashboard son sumamente útiles.', avatar: 'IC' },
                            { name: 'Dr. Fernando Reyes', role: 'Abogado Tributarista', quote: 'Crear mi perfil tomó solo 10 minutos. La interfaz es intuitiva y la calidad de los clientes es excelente porque llegan listos para una atención profesional.', avatar: 'FR' },
                        ].map((t, i) => (
                            <div key={t.name} className="card reveal" style={{ padding: '2rem', transitionDelay: `${i * 0.1}s` }}>
                                <div className="stars" style={{ marginBottom: '0.75rem' }}>★★★★★</div>
                                <p style={{ color: 'var(--color-text)', lineHeight: 1.8, fontSize: '0.92rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        background: ['linear-gradient(135deg, #F0B429, #C68A0A)', 'linear-gradient(135deg, #13C4A3, #0B8A73)', 'linear-gradient(135deg, #7C3AED, #5B21B6)'][i],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                                    }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{t.name}</strong>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== CTA FINAL ==================== */}
            <section className="section" style={{
                background: 'linear-gradient(135deg, #0C2340, #1B4D8F)',
                textAlign: 'center', padding: '6rem 1rem', position: 'relative', overflow: 'hidden',
                marginTop: 0
            }}>
                <div className="blob" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(240,180,41,0.12), transparent)' }} />

                <div className="container reveal" style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                        ¿Listo para recibir más clientes?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                        Únete hoy de forma completamente gratuita. Configure su perfil en minutos y empiece a recibir consultas de clientes potenciales que lo necesitan.
                    </p>
                    <Link href="/registro" className="btn btn-primary btn-lg" style={{ fontSize: '1.1rem' }}>
                        🚀 Crear Cuenta Gratis
                    </Link>
                </div>
            </section>
        </>
    );
}
