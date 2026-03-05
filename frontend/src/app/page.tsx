'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { C } from '@/lib/theme';

/* ==================== TYPES ==================== */
interface Service { id: string; name: string; description: string; icon: string; }
interface Testimonial { id: string; clientName: string; clientRole?: string; rating: number; content: string; }
interface Lawyer {
    id: string; name: string;
    lawyerProfile?: { specialties: string[]; city: string; ratePerHour: number; photoUrl: string; yearsExperience: number; };
}

/* ==================== MOCK DATA ==================== */
const mockServices: Service[] = [
    { id: '1', name: 'Consulta Legal Inicial', description: 'Evaluación personalizada de su caso por un abogado especializado. Analizamos documentos, identificamos opciones legales y le presentamos un plan de acción claro.', icon: 'scale' },
    { id: '2', name: 'Representación en Juicio', description: 'Defensa integral en tribunales civiles, penales y laborales. Preparamos estrategia, redactamos escritos, presentamos pruebas y acompañamos en cada audiencia.', icon: 'court' },
    { id: '3', name: 'Redacción de Contratos', description: 'Elaboración de contratos blindados legalmente: mercantiles, laborales, arrendamiento, compraventa y asociaciones. Protegemos sus intereses.', icon: 'file-text' },
    { id: '4', name: 'Asesoría Empresarial', description: 'Acompañamiento legal completo: constitución de sociedades, cumplimiento normativo, gobierno corporativo, fusiones y adquisiciones.', icon: 'briefcase' },
    { id: '5', name: 'Derecho de Familia', description: 'Manejo sensible de divorcios, custodia, pensión alimenticia, adopción, herencias y testamentos. Protegemos lo que más importa.', icon: 'users' },
    { id: '6', name: 'Derecho Inmobiliario', description: 'Compraventa de inmuebles, hipotecas, arrendamientos, desalojos y regularización de títulos. Su inversión segura.', icon: 'home' },
];

const mockTestimonials: Testimonial[] = [
    { id: '1', clientName: 'Roberto Hernández', clientRole: 'Director General', rating: 5, content: 'Contratamos a BufeteLegal para una reestructuración corporativa compleja. El equipo dominó cada detalle legal y nos explicó todo en lenguaje claro. Resolvieron todo en 3 meses.' },
    { id: '2', clientName: 'Carmen Díaz', clientRole: 'Emprendedora', rating: 5, content: 'Tenía un conflicto laboral imposible. La Dra. Rodríguez estudió mi caso a fondo, me explicó mis opciones y logró un acuerdo favorable sin ir a juicio.' },
    { id: '3', clientName: 'Miguel Á. Pérez', clientRole: 'Ingeniero Civil', rating: 5, content: 'Identificaron cláusulas problemáticas que yo no había notado y redactaron un contrato nuevo que protegía todos mis intereses. Impecable.' },
    { id: '4', clientName: 'Sofía Ramírez', clientRole: 'Médico Especialista', rating: 5, content: 'Revisaron títulos, gravámenes, y me acompañaron hasta el registro. Me ahorraron problemas que hubieran costado miles de dólares.' },
];


/* ==================== HOOKS ==================== */
/* ==================== HOOKS ==================== */
function useScrollReveal() {
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
        );
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-bounce, .reveal-pop, .stagger-children').forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);
}

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const t0 = performance.now();
                const tick = (now: number) => {
                    const p = Math.min((now - t0) / duration, 1);
                    setCount(Math.floor(end * (1 - Math.pow(1 - p, 3))));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [end, duration]);
    return <div ref={ref} className="counter-number">{count}{suffix}</div>;
}

/* ==================== PHYSICS CAROUSEL ==================== */
function PhysicsCarousel({ children, itemWidth = 340 }: { children: React.ReactNode; itemWidth?: number }) {
    const [offset, setOffset] = useState(0);
    const vel = useRef(0);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startOff = useRef(0);
    const lastX = useRef(0);
    const lastT = useRef(0);
    const frame = useRef(0);
    const autoRef = useRef<any>(null);
    const n = Array.isArray(children) ? children.length : 1;
    const minOff = -(n * (itemWidth + 24) - (typeof window !== 'undefined' ? Math.min(window.innerWidth, 1200) : 900));
    const maxOff = 0;

    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        autoRef.current = setInterval(() => {
            if (!dragging.current) {
                const speed = hovered ? 0.1 : 0.4;
                setOffset(p => { const nx = p - speed; return nx <= minOff ? maxOff : nx; });
            }
        }, 30);
        return () => clearInterval(autoRef.current);
    }, [minOff, maxOff, hovered]);

    const physics = useCallback(() => {
        if (dragging.current) return;
        vel.current *= 0.94;
        setOffset(p => {
            let nx = p + vel.current;
            if (nx > maxOff) { vel.current += (maxOff - nx) * 0.08; nx = p + vel.current; }
            else if (nx < minOff) { vel.current += (minOff - nx) * 0.08; nx = p + vel.current; }
            return nx;
        });
        if (Math.abs(vel.current) > 0.15) frame.current = requestAnimationFrame(physics);
    }, [maxOff, minOff]);

    const down = (e: React.PointerEvent) => {
        dragging.current = true; startX.current = e.clientX; startOff.current = offset;
        lastX.current = e.clientX; lastT.current = performance.now(); vel.current = 0;
        cancelAnimationFrame(frame.current); clearInterval(autoRef.current);
    };
    const move = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const now = performance.now(); const dt = now - lastT.current;
        if (dt > 0) vel.current = (e.clientX - lastX.current) / dt * 16;
        lastX.current = e.clientX; lastT.current = now;
        setOffset(Math.max(minOff - 100, Math.min(maxOff + 100, startOff.current + e.clientX - startX.current)));
    };
    const up = () => {
        dragging.current = false; frame.current = requestAnimationFrame(physics);
        setTimeout(() => {
            autoRef.current = setInterval(() => {
                if (!dragging.current) {
                    const speed = hovered ? 0.1 : 0.4;
                    setOffset(p => { const nx = p - speed; return nx <= minOff ? maxOff : nx; });
                }
            }, 30);
        }, 4000);
    };

    return (
        <div className="physics-carousel"
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={() => { up(); setHovered(false); }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        >
            <div className="physics-carousel-track" style={{ transform: `translateX(${offset}px)` }}>{children}</div>
        </div>
    );
}


/* ==================== PARALLAX SECTION ==================== */
function ParallaxSection({ children, speed = 0.5, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleScroll = () => {
            if (!ref.current) return;
            const top = ref.current.getBoundingClientRect().top;
            ref.current.style.transform = `translateY(${top * speed * 0.1}px)`;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);
    return <div ref={ref} className={className} style={{ willChange: 'transform' }}>{children}</div>;
}

/* ==================== TILT CARD ==================== */
function TiltCard({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const handleMove = (e: React.MouseEvent) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (ref.current) ref.current.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
    };
    const handleLeave = () => { if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)'; };
    return (
        <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className}
            style={{ transition: 'transform 0.2s ease-out', willChange: 'transform', ...style }}>{children}</div>
    );
}

/* ==================== MAIN PAGE ==================== */
export default function LandingPage() {
    const [services, setServices] = useState<Service[]>(mockServices);
    const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useScrollReveal();

    useEffect(() => {
        apiFetch('/public/services').then(d => setServices(d.services)).catch(() => { });
        apiFetch('/public/testimonials').then(d => setTestimonials(d.testimonials)).catch(() => { });
        apiFetch('/public/lawyers?limit=10').then(d => setLawyers(d.lawyers)).catch(() => { });
    }, []);

    return (
        <>
            {/* ==================== HERO ==================== */}
            <section
                onMouseMove={(e) => setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 25, y: (e.clientY / window.innerHeight - 0.5) * 25 })}
                style={{
                    background: `linear-gradient(145deg, ${C.navyDeep} 0%, ${C.navy} 35%, ${C.navyDark} 70%, ${C.navyDeep} 100%)`,
                    color: C.white, padding: '8rem 1rem 5rem', position: 'relative', overflow: 'hidden',
                    minHeight: '80vh', display: 'flex', alignItems: 'center',
                }}
            >

                {/* Grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1000px' }}>
                    <div className="animate-fadeInUp" style={{ textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                            background: `linear-gradient(135deg, ${C.yellow}30, ${C.orange}20)`,
                            border: `1px solid ${C.yellow}50`,
                            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)',
                            fontSize: '0.88rem', color: C.yellowLight, fontWeight: 600,
                            backdropFilter: 'blur(10px)', marginBottom: '2.5rem',
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.yellowBright, animation: 'pulse 2s ease-in-out infinite', boxShadow: `0 0 12px ${C.yellow}` }} />
                            Más de 500 casos resueltos exitosamente
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '1.75rem',
                            textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            color: C.white
                        }}>
                            Su problema legal tiene solución.
                            <br />
                            <span style={{
                                background: `linear-gradient(135deg, ${C.yellowBright}, ${C.yellow}, ${C.orange})`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }}>Nosotros la encontramos.</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', lineHeight: 1.85, color: C.textLight, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                            Somos un equipo de <strong style={{ color: C.yellow }}>abogados especializados</strong> con más de 20 años de experiencia.
                            Le explicamos su caso en un lenguaje claro, le presentamos sus opciones y luchamos para obtener el mejor resultado.
                            <strong style={{ color: C.yellowLight }}> Primera consulta sin compromiso.</strong>
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/abogados" className="btn btn-lg" style={{
                                background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                color: C.navyDeep, fontSize: '1.05rem', padding: '1.1rem 2.5rem',
                                boxShadow: `0 8px 32px ${C.yellow}50`, border: 'none', fontWeight: 900,
                                textShadow: '0 1px 2px rgba(255,255,255,0.2)'
                            }}>Agendar Consulta Gratuita →</Link>
                            <Link href="/#como-funciona" className="btn btn-lg" style={{
                                background: `${C.yellow}15`, color: C.yellow, fontSize: '1.05rem',
                                padding: '1.1rem 2.5rem', border: `2px solid ${C.yellow}40`, backdropFilter: 'blur(10px)',
                            }}>¿Cómo Funciona?</Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
                            {[
                                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, label: 'Confidencialidad garantizada' },
                                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, label: 'Respuesta en 24 horas' },
                                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>, label: 'Pagos flexibles' }
                            ].map(t => (
                                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: `${C.yellow}15`, border: `1px solid ${C.yellow}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>{t.icon}</span>
                                    <span style={{ fontSize: '1rem', color: C.white, fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '0.02em' }}>{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <ParallaxSection speed={0.8}>
                        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '2.5rem', maxWidth: '800px', margin: '2.5rem auto 0' }}>
                            {[
                                { end: 500, suffix: '+', label: 'Casos ganados', color: C.yellow, icon: 'trophy' },
                                { end: 20, suffix: '+', label: 'Años experiencia', color: C.yellow, icon: 'calendar' },
                                { end: 50, suffix: '+', label: 'Abogados expertos', color: C.yellow, icon: 'user-check' },
                                { end: 98, suffix: '%', label: 'Satisfacción', color: C.yellow, icon: 'star' },
                            ].map(s => (
                                <TiltCard key={s.label} style={{
                                    textAlign: 'center', padding: '1.25rem 0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(12px)',
                                    border: `1px solid rgba(255,255,255,0.1)`,
                                    borderRadius: 'var(--radius-xl)',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                                        {s.icon === 'trophy' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>}
                                        {s.icon === 'calendar' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>}
                                        {s.icon === 'user-check' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>}
                                        {s.icon === 'star' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white }}><AnimatedCounter end={s.end} suffix={s.suffix} /></div>
                                    <div style={{ fontSize: '0.65rem', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                </TiltCard>
                            ))}
                        </div>
                    </ParallaxSection>
                </div>

                {/* Scroll indicator */}
                <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
                    <div style={{ width: '24px', height: '40px', border: `2px solid ${C.yellow}40`, borderRadius: 'var(--radius-full)', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
                        <div style={{ width: '3px', height: '8px', background: C.yellow, borderRadius: 'var(--radius-full)', animation: 'float 1.5s ease-in-out infinite' }} />
                    </div>
                </div>
            </section>



            {/* ==================== CÓMO FUNCIONA ==================== */}
            <section id="como-funciona" className="page-section" style={{ position: 'relative', overflow: 'hidden', background: C.navyDark, scrollMarginTop: '15vh' }}>
                <div className="container">
                    <h2 className="section-title reveal-bounce" style={{ color: C.yellow }}>¿Cómo funciona nuestro servicio?</h2>
                    <p className="section-subtitle reveal" style={{ color: C.textMuted }}>Obtener asesoría legal profesional es más fácil de lo que piensa</p>

                    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {[
                            {
                                step: '01', title: 'Cuéntenos su caso', desc: 'Llene el formulario o llámenos. Describa su situación y le asignamos el abogado más adecuado.',
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                            },
                            {
                                step: '02', title: 'Consulta personalizada', desc: 'Su abogado le contacta en menos de 24 horas. Analizamos y explicamos opciones en lenguaje sencillo.',
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" /><circle cx="12" cy="11" r="3" /><circle cx="12" cy="12" r="10" /></svg>
                            },
                            {
                                step: '03', title: 'Plan de acción claro', desc: 'Estrategia legal detallada con plazos, costos transparentes y resultados posibles.',
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
                            },
                            {
                                step: '04', title: 'Resolución exitosa', desc: 'Ejecutamos la estrategia, le informamos y trabajamos hasta obtener el mejor resultado.',
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                            },
                        ].map((item, i) => (
                            <TiltCard key={item.step} style={{
                                textAlign: 'center', padding: '2rem 1.5rem', borderRadius: 'var(--radius-xl)',
                                background: C.offWhite,
                                border: `1px solid rgba(0,0,0,0.05)`, position: 'relative',
                                boxShadow: `0 10px 30px rgba(0,0,0,0.05)`
                            }}>
                                <div style={{
                                    position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                                    background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: C.navyDeep,
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 900, boxShadow: `0 4px 12px ${C.yellow}40`,
                                }}>{item.step}</div>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: `${C.yellow}10`, border: `1px solid ${C.yellow}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0rem auto 1rem',
                                }}>{item.icon}</div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: C.navyDeep, fontWeight: 700 }}>{item.title}</h3>
                                <p style={{ color: C.navyDark, lineHeight: 1.7, fontSize: '0.88rem', opacity: 0.8 }}>{item.desc}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>



            {/* ==================== POR QUÉ ELEGIRNOS ==================== */}
            <section id="nosotros" className="page-section" style={{ position: 'relative', overflow: 'hidden', background: C.navy, scrollMarginTop: '15vh' }}>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="section-title reveal-bounce" style={{ color: C.yellowLight }}>¿Por qué elegirnos?</h2>
                    <p className="section-subtitle reveal" style={{ color: C.textMuted }}>Lo que nos diferencia de otras firmas</p>

                    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="m3.34 19 1.4-1.4" /><path d="m4.34 14.34 1.4-1.4" /><path d="M5.31 9.3c.2-1 .6-1.9 1.2-2.7L12.5 12.5" /><path d="m6.66 5.34 1.4-1.4" /><path d="m7.34 4.34 1.4-1.4" /><path d="M9.3 5.31c1-.2 1.9-.6 2.7-1.2L16.5 6.5" /><path d="m14.34 4.34 1.4-1.4" /><path d="m15.34 3.34 1.4-1.4" /><path d="m17.5 12.5 4.5 4.5" /><path d="m17.5 7.5 4.5-4.5" /><path d="m18.5 13.5 1.4 1.4" /><path d="m19 14.3 1.4 1.4" /><path d="m19 8.3 1.4-1.4" /><path d="m20.34 7.34 1.4-1.4" /><path d="m3.34 17.5 4.5-4.5" /><path d="m3.34 7.5 4.5 4.5" /><path d="m4.34 18.5 1.4-1.4" /><path d="m8.3 19c-1-.2-1.9-.6-2.7-1.2L11.5 12.5" /><path d="M9.3 18.69c1 .2 1.9.6 2.7 1.2l4.5-4.5" /></svg>, title: 'Especialización Real', text: 'Cada caso es atendido por un especialista en esa área del derecho con años de experiencia.', highlight: 'Cada abogado domina su especialidad' },
                            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8" /><path d="M8 13h6" /></svg>, title: 'Comunicación Clara', text: 'Le explicamos todo en palabras simples. Sin sorpresas ni jerga legal confusa.', highlight: 'Sin jerga legal confusa' },
                            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>, title: 'Transparencia Total', text: 'Antes de iniciar, conoce exactamente los costos, plazos y probabilidades de éxito.', highlight: 'Sin costos ocultos' },
                        ].map((item, i) => (
                            <TiltCard key={item.title} style={{
                                background: C.offWhite,
                                border: `1px solid rgba(0,0,0,0.05)`,
                                borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem',
                                textAlign: 'center',
                                boxShadow: `0 15px 45px rgba(0,0,0,0.08)`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '72px', height: '72px', borderRadius: '22px',
                                    background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                    boxShadow: `0 10px 30px ${C.yellow}50`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem', flexShrink: 0
                                }}>
                                    {/* Clone SVG to change stroke to white for high contrast */}
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { stroke: C.white, width: 34, height: 34, strokeWidth: 2.5 })}
                                </div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem', color: C.navyDeep, fontWeight: 800 }}>{item.title}</h3>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <span style={{
                                        display: 'inline-block', background: `${C.orange}15`, color: C.orangeDeep,
                                        padding: '0.3rem 0.9rem', borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem', fontWeight: 800, border: `1px solid ${C.orange}30`,
                                    }}>{item.highlight}</span>
                                </div>
                                <p style={{ color: C.navyDark, lineHeight: 1.8, fontSize: '0.92rem', opacity: 0.85, margin: 0 }}>{item.text}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>



            {/* ==================== SERVICIOS ==================== */}
            <section id="servicios" className="page-section" style={{ position: 'relative', overflow: 'hidden', background: C.navyDark, scrollMarginTop: '15vh' }}>
                <div className="container">
                    <h2 className="section-title reveal-bounce" style={{ color: C.yellow }}>Áreas de Práctica Legal</h2>
                    <p className="section-subtitle reveal" style={{ color: C.textMuted }}>Conozca cada uno de nuestros servicios</p>

                    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                        {services.map((service, i) => (
                            <TiltCard key={service.id} style={{
                                padding: '1.75rem', cursor: 'default', borderRadius: 'var(--radius-xl)',
                                background: C.offWhite,
                                border: `1px solid rgba(0,0,0,0.05)`, borderLeft: `5px solid ${C.yellow}`,
                                boxShadow: `0 10px 25px rgba(0,0,0,0.05)`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                                        background: `${C.yellow}12`, border: `1px solid ${C.yellow}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {service.icon === 'scale' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h18" /></svg>}
                                        {service.icon === 'court' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M3 7h18" /><path d="m12 2-9 5 9 5 9-5-9-5Z" /><path d="M6 7v14" /><path d="M10 7v14" /><path d="M14 7v14" /><path d="M18 7v14" /></svg>}
                                        {service.icon === 'file-text' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>}
                                        {service.icon === 'briefcase' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>}
                                        {service.icon === 'users' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                                        {service.icon === 'home' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: C.navyDeep, fontWeight: 700 }}>{service.name}</h3>
                                        <p style={{ color: C.navyDark, lineHeight: 1.7, fontSize: '0.85rem', opacity: 0.85 }}>{service.description}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid rgba(0,0,0,0.05)` }}>
                                    <Link href="/abogados" style={{ color: C.orangeDeep, fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                        Consultar un especialista →
                                    </Link>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>



            {/* ==================== TESTIMONIOS ==================== */}
            <section id="testimonios" className="page-section" style={{ position: 'relative', overflow: 'hidden', background: C.navyDeep, scrollMarginTop: '15vh' }}>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="section-title reveal-bounce" style={{ color: C.yellowLight }}>Historias Reales de Clientes</h2>
                    <p className="section-subtitle reveal" style={{ color: C.textMuted }}>Lea lo que dicen quienes confiaron en nosotros</p>

                    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {testimonials.map((t, i) => (
                            <TiltCard key={t.id} style={{
                                padding: '1.75rem',
                                background: C.offWhite,
                                border: `1px solid rgba(0,0,0,0.05)`, borderRadius: 'var(--radius-xl)',
                                display: 'flex', flexDirection: 'column',
                                boxShadow: `0 10px 25px rgba(0,0,0,0.05)`
                            }}>
                                <div style={{ marginBottom: '0.75rem', fontSize: '1rem', color: C.yellow }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                                <p style={{ color: C.navyDeep, lineHeight: 1.75, fontSize: '0.88rem', marginBottom: '1.25rem', flex: 1, fontStyle: 'italic', opacity: 0.9 }}>
                                    &ldquo;{t.content}&rdquo;
                                </p>
                                <div style={{ borderTop: `1px solid rgba(0,0,0,0.05)`, paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: C.navyDeep, fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                                        boxShadow: `0 4px 12px ${C.yellow}30`,
                                    }}>{t.clientName.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                                    <div>
                                        <strong style={{ color: C.navyDeep, fontSize: '0.85rem', display: 'block' }}>{t.clientName}</strong>
                                        {t.clientRole && <span style={{ fontSize: '0.75rem', color: C.navyDark, opacity: 0.6 }}>{t.clientRole}</span>}
                                    </div>
                                    <span style={{
                                        marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700,
                                        color: '#059669', background: 'rgba(5,150,105,0.08)',
                                        padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(5,150,105,0.2)',
                                    }}>✓ Verificado</span>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>



            {/* ==================== EQUIPO ==================== */}
            <section className="page-section" style={{ position: 'relative', overflow: 'hidden', background: C.navy }}>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="section-title reveal-bounce" style={{ color: C.yellow }}>Conozca a Nuestro Equipo</h2>
                    <p className="section-subtitle reveal" style={{ color: C.textMuted }}>Haga clic en cualquier abogado para agendar una consulta</p>
                    <p className="reveal" style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.82rem', marginBottom: '2rem', marginTop: '-1.5rem' }}>← Deslice para ver más →</p>

                    <PhysicsCarousel itemWidth={340}>
                        {lawyers.map((lawyer, i) => (
                            <div key={lawyer.id} className="physics-carousel-item" style={{
                                background: `linear-gradient(160deg, rgba(27,59,90,0.95), rgba(16,37,64,0.98))`,
                                border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '1.25rem',
                                padding: '2rem 1.5rem', textAlign: 'center', backdropFilter: 'blur(20px)',
                                position: 'relative', overflow: 'hidden',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                                display: 'flex', flexDirection: 'column', minHeight: '480px'
                            }}>
                                {/* Top accent line */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${C.yellow}, transparent)` }} />

                                {/* Avatar */}
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0.5rem auto 1.2rem', fontSize: '1.4rem', color: C.navyDeep, fontWeight: 800,
                                    boxShadow: `0 6px 20px ${C.yellow}30`,
                                    border: '3px solid rgba(255,255,255,0.15)',
                                }}>{lawyer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>

                                {/* Name - WHITE */}
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: C.white, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{lawyer.name}</h3>

                                {lawyer.lawyerProfile && (
                                    <>
                                        {/* Location - clean white */}
                                        <p style={{ fontSize: '0.82rem', color: C.textMuted, marginBottom: '0.9rem' }}>
                                            📍 {lawyer.lawyerProfile.city} · {lawyer.lawyerProfile.yearsExperience} años de experiencia
                                        </p>

                                        {/* Specialties - clean white on subtle bg */}
                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                                            {lawyer.lawyerProfile.specialties.map(s => (
                                                <span key={s} style={{
                                                    background: 'rgba(255,255,255,0.08)', color: C.white, padding: '0.25rem 0.7rem',
                                                    borderRadius: 'var(--radius-full)', fontSize: '0.72rem',
                                                    fontWeight: 500, border: '1px solid rgba(255,255,255,0.12)',
                                                }}>{s}</span>
                                            ))}
                                        </div>

                                        {/* Divider */}
                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0 1rem' }} />

                                        {/* Price - white */}
                                        <p style={{
                                            fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: C.white,
                                        }}>Desde <span style={{ color: C.yellow, fontWeight: 900, fontSize: '1.25rem', textShadow: `0 0 10px ${C.yellow}40` }}>${lawyer.lawyerProfile.ratePerHour}</span>/hora</p>
                                    </>
                                )}
                                <Link href={`/abogados/${lawyer.id}`} className="btn btn-sm" style={{
                                    width: '100%', background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                    color: C.navyDeep, fontWeight: 700,
                                    border: 'none', boxShadow: `0 4px 16px ${C.yellow}30`,
                                    marginTop: 'auto'
                                }}>Ver Perfil y Agendar →</Link>
                            </div>
                        ))}
                    </PhysicsCarousel>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }} className="reveal-pop">
                        <Link href="/abogados" className="btn btn-lg" style={{
                            background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                            color: C.navyDeep, boxShadow: `0 8px 32px ${C.yellow}50`, border: 'none', fontWeight: 800,
                        }}>Ver Todos los Abogados →</Link>
                    </div>
                </div>
            </section>



            {/* ==================== FAQ ==================== */}
            <section id="faq" className="page-section" style={{ position: 'relative', overflow: 'hidden', background: C.navyDark, scrollMarginTop: '15vh' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <h2 className="section-title reveal-bounce" style={{ color: C.yellow }}>Preguntas Frecuentes</h2>
                    <p className="section-subtitle reveal" style={{ color: C.textMuted }}>Respuestas claras a dudas comunes</p>

                    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: '¿La primera consulta tiene algún costo?', a: 'No. Es completamente gratuita y sin compromiso. Un abogado especializado evaluará su caso.' },
                            { q: '¿Cuánto tiempo tarda un caso?', a: 'Depende del tipo. En la primera consulta le damos un estimado realista con plazos claros.' },
                            { q: '¿Cómo manejan los honorarios?', a: 'Transparencia total. Presupuesto detallado por escrito antes de iniciar. Pagos flexibles.' },
                            { q: '¿Puedo cambiar de abogado?', a: 'Sí. Le reasignamos otro especialista inmediatamente sin costo adicional.' },
                            { q: '¿Atienden en todo el país?', a: 'Sí. Abogados en principales ciudades y consultas virtuales para todo el territorio.' },
                        ].map((faq, i) => (
                            <TiltCard key={i} style={{
                                padding: '1.5rem', borderRadius: 'var(--radius-xl)',
                                background: C.offWhite,
                                border: `1px solid rgba(0,0,0,0.05)`,
                                boxShadow: `0 8px 20px rgba(0,0,0,0.05)`
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.navyDeep, marginBottom: '0.6rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                    <span style={{ color: C.orangeDeep, fontSize: '1rem', flexShrink: 0 }}>●</span>
                                    {faq.q}
                                </h3>
                                <p style={{ color: C.navyDark, lineHeight: 1.7, fontSize: '0.88rem', paddingLeft: '1.6rem', opacity: 0.85 }}>{faq.a}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>



            {/* ==================== CTA FINAL ==================== */}
            <section style={{ padding: '4rem 1rem', position: 'relative', overflow: 'hidden', textAlign: 'center', background: C.navyDeep }}>
                <div className="container reveal-bounce" style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-block', background: `linear-gradient(135deg, ${C.yellow}25, ${C.orange}18)`,
                        border: `1px solid ${C.yellow}40`, padding: '0.4rem 1.2rem',
                        borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: C.yellow, fontWeight: 600, marginBottom: '1.5rem',
                    }}>⚡ Primera consulta 100% gratuita</div>

                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1.25rem', color: C.white, fontFamily: 'var(--font-heading)' }}>
                        ¿Tiene un problema legal?<br />
                        <span style={{
                            background: `linear-gradient(135deg, ${C.yellowBright}, ${C.yellow}, ${C.orange})`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Dé el primer paso hoy.</span>
                    </h2>
                    <p style={{ color: C.textLight, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                        No deje que un problema legal se vuelva mayor. Hable con un abogado hoy, sin costo y sin compromiso.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/abogados" className="btn btn-lg" style={{
                            background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                            color: C.navyDeep, fontSize: '1.05rem', boxShadow: `0 8px 32px ${C.yellow}50`, border: 'none', fontWeight: 800,
                        }}>🗓️ Agendar Mi Consulta Gratuita</Link>
                        <Link href="/registro" className="btn btn-lg" style={{
                            background: `${C.yellow}15`, color: C.yellow, border: `2px solid ${C.yellow}35`, backdropFilter: 'blur(8px)',
                        }}>Crear Cuenta Gratis</Link>
                    </div>
                    <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: '1.5rem' }}>🔒 Su información es 100% confidencial</p>
                </div>
            </section>
        </>
    );
}
