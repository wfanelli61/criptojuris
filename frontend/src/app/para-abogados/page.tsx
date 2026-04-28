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

            {/* ==================== PLANES Y PRECIOS ==================== */}
            <section className="section" style={{ background: 'linear-gradient(180deg, #060F1D 0%, #0C2340 100%)' }}>
                <div className="container">
                    <h2 className="section-title reveal" style={{ color: '#fff' }}>Planes para abogados</h2>
                    <p className="section-subtitle reveal" style={{ color: 'rgba(255,255,255,0.6)' }}>Sin contratos. Cancele cuando quiera. Empiece gratis 14 días.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
                        {/* Plan Básico */}
                        <div className="reveal" style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1.25rem',
                            padding: '2.25rem 1.75rem',
                            display: 'flex', flexDirection: 'column',
                            transition: 'border-color 0.3s ease',
                        }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Plan Básico</span>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', margin: '0.6rem 0' }}>
                                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>$19</span>
                                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>/mes</span>
                                </div>
                                <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>Ideal para abogados que comienzan a recibir clientes en línea.</p>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                                {['Perfil profesional verificado', 'Hasta 10 citas al mes', 'Chat con clientes', 'Aparición en el directorio', 'Soporte por email'].map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                                        <span style={{ color: '#F0B429', fontWeight: 700 }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href="/registro" style={{
                                display: 'block', textAlign: 'center', padding: '0.8rem',
                                border: '1.5px solid rgba(240,180,41,0.5)', borderRadius: '0.75rem',
                                color: '#F0B429', fontWeight: 700, fontSize: '0.9rem',
                                textDecoration: 'none', transition: 'all 0.2s',
                            }}
                                onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(240,180,41,0.12)'; e.currentTarget.style.borderColor = '#F0B429'; }}
                                onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.5)'; }}
                            >
                                Comenzar gratis 14 días
                            </a>
                        </div>

                        {/* Plan Pro - DESTACADO */}
                        <div className="reveal" style={{
                            background: 'linear-gradient(145deg, #1B4D8F 0%, #0C2340 100%)',
                            border: '2px solid #F0B429',
                            borderRadius: '1.25rem',
                            padding: '2.25rem 1.75rem',
                            display: 'flex', flexDirection: 'column',
                            position: 'relative',
                            boxShadow: '0 0 40px rgba(240,180,41,0.15), 0 20px 40px rgba(0,0,0,0.4)',
                            transform: 'translateY(-6px)',
                        }}>
                            <div style={{
                                position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                                color: '#0C2340', fontSize: '0.7rem', fontWeight: 800,
                                padding: '0.28rem 1.1rem', borderRadius: '9999px',
                                textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                            }}>
                                ⭐ Más Popular
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Plan Pro</span>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', margin: '0.6rem 0' }}>
                                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#F0B429', lineHeight: 1 }}>$49</span>
                                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem' }}>/mes</span>
                                </div>
                                <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>Para abogados activos que quieren maximizar su visibilidad.</p>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                                {['Todo lo del Plan Básico', 'Citas ilimitadas', 'Posición destacada en búsquedas', 'Estadísticas de perfil', 'Consulta inicial gratuita configurable', 'Soporte prioritario', 'Insignia "Verificado Pro"'].map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                                        <span style={{ color: '#F0B429', fontWeight: 700 }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href="/registro" style={{
                                display: 'block', textAlign: 'center', padding: '0.85rem',
                                background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                                borderRadius: '0.75rem',
                                color: '#0C2340', fontWeight: 800, fontSize: '0.95rem',
                                textDecoration: 'none',
                            }}>
                                Comenzar gratis 14 días →
                            </a>
                        </div>

                        {/* Plan Premium */}
                        <div className="reveal" style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1.25rem',
                            padding: '2.25rem 1.75rem',
                            display: 'flex', flexDirection: 'column',
                            transition: 'border-color 0.3s ease',
                        }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Plan Premium</span>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', margin: '0.6rem 0' }}>
                                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>$99</span>
                                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>/mes</span>
                                </div>
                                <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>Para firmas y abogados de alto volumen con presencia máxima.</p>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                                {['Todo lo del Plan Pro', 'Perfil en portada del home', 'Múltiples abogados (hasta 5)', 'Gestión de reputación asistida', 'Reportes mensuales detallados', 'Gerente de cuenta dedicado'].map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                                        <span style={{ color: '#F0B429', fontWeight: 700 }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href="/registro" style={{
                                display: 'block', textAlign: 'center', padding: '0.8rem',
                                border: '1.5px solid rgba(240,180,41,0.5)', borderRadius: '0.75rem',
                                color: '#F0B429', fontWeight: 700, fontSize: '0.9rem',
                                textDecoration: 'none', transition: 'all 0.2s',
                            }}
                                onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(240,180,41,0.12)'; e.currentTarget.style.borderColor = '#F0B429'; }}
                                onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.5)'; }}
                            >
                                Contactar ventas
                            </a>
                        </div>
                    </div>

                    <p className="reveal" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
                        Precios en USD · Tarjeta, transferencia o criptomonedas · Cancela en cualquier momento
                    </p>
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
