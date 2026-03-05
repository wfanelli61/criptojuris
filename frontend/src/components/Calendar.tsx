'use client';

import React, { useState, useMemo, useEffect } from 'react';

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    clientName: string;
    status: string;
}

interface CalendarProps {
    events: CalendarEvent[];
}

export default function Calendar({ events }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [now, setNow] = useState(new Date());

    // Tick every second for countdown
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getCountdown = (targetDate: Date) => {
        const diff = targetDate.getTime() - now.getTime();
        if (diff <= 0) return null; // already passed
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return { days, hours, minutes, seconds, total: diff };
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const changeMonth = (delta: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentDate(new Date(year, month + delta, 1));
            setSelectedDay(null);
            setIsTransitioning(false);
        }, 200);
    };

    const goToToday = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            const today = new Date();
            setCurrentDate(today);
            setSelectedDay(today.getDate());
            setIsTransitioning(false);
        }, 200);
    };

    // Build day cells
    const daysBefore = firstDay;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const isToday = (d: number) => {
        const now = new Date();
        return d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    };

    const getEventsForDay = (d: number) =>
        events.filter(e => e.date.getDate() === d && e.date.getMonth() === month && e.date.getFullYear() === year);

    // Events for selected day
    const selectedDayEvents = useMemo(() => {
        if (selectedDay === null) return [];
        return getEventsForDay(selectedDay);
    }, [selectedDay, events, month, year]);

    const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
        PENDIENTE: { color: '#92400E', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', label: 'Pendiente' },
        CONFIRMADA: { color: '#065F46', bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', label: 'Confirmada' },
        CANCELADA: { color: '#991B1B', bg: 'linear-gradient(135deg, #FEE2E2, #FECACA)', label: 'Cancelada' },
        FINALIZADA: { color: '#1E40AF', bg: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', label: 'Finalizada' },
    };

    // Count events per status for the month
    const monthStats = useMemo(() => {
        const monthEvents = events.filter(e => e.date.getMonth() === month && e.date.getFullYear() === year);
        return {
            total: monthEvents.length,
            pendientes: monthEvents.filter(e => e.status === 'PENDIENTE').length,
            confirmadas: monthEvents.filter(e => e.status === 'CONFIRMADA').length,
        };
    }, [events, month, year]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: selectedDay !== null ? '1fr 340px' : '1fr',
            gap: '0',
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'var(--font-body)',
        }}>
            {/* ===== LEFT: Calendar Grid ===== */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--color-border-light)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                }}>
                    <div>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            color: 'var(--color-white)',
                            margin: 0,
                            lineHeight: 1.1,
                        }}>
                            {monthNames[month]}
                            <span style={{ color: 'var(--color-gold)', marginLeft: '0.5rem', fontWeight: 400 }}>{year}</span>
                        </h2>
                        <div style={{
                            display: 'flex', gap: '1rem', marginTop: '0.5rem',
                            fontSize: '0.75rem', fontWeight: 600,
                        }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {monthStats.total} cita{monthStats.total !== 1 ? 's' : ''} este mes
                            </span>
                            {monthStats.pendientes > 0 && (
                                <span style={{ color: 'var(--color-gold)' }}>
                                    ● {monthStats.pendientes} pendiente{monthStats.pendientes !== 1 ? 's' : ''}
                                </span>
                            )}
                            {monthStats.confirmadas > 0 && (
                                <span style={{ color: '#6EE7B7' }}>
                                    ● {monthStats.confirmadas} confirmada{monthStats.confirmadas !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={() => changeMonth(-1)} style={navBtnStyle}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={goToToday} style={{
                            ...navBtnStyle,
                            padding: '0.45rem 1rem',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase' as const,
                        }}>
                            Hoy
                        </button>
                        <button onClick={() => changeMonth(1)} style={navBtnStyle}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Day Labels */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                    background: 'var(--color-primary-50)',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                        <div key={d} style={{
                            textAlign: 'center',
                            padding: '0.6rem 0',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: 'var(--color-primary)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    flex: 1,
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'scale(0.97)' : 'scale(1)',
                    transition: 'opacity 0.2s, transform 0.2s',
                }}>
                    {/* Previous month overflow days */}
                    {Array.from({ length: daysBefore }, (_, i) => (
                        <div key={`prev-${i}`} style={emptyCellStyle}>
                            <span style={{ color: '#D1D5DB', fontSize: '0.8rem', fontWeight: 500 }}>
                                {prevMonthDays - daysBefore + i + 1}
                            </span>
                        </div>
                    ))}

                    {/* Current month days */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const d = i + 1;
                        const dayEvents = getEventsForDay(d);
                        const hasEvents = dayEvents.length > 0;
                        const today = isToday(d);
                        const selected = selectedDay === d;

                        return (
                            <div
                                key={d}
                                onClick={() => setSelectedDay(selected ? null : d)}
                                style={{
                                    minHeight: '90px',
                                    padding: '0.4rem',
                                    borderRight: '1px solid var(--color-border-light)',
                                    borderBottom: '1px solid var(--color-border-light)',
                                    cursor: 'pointer',
                                    background: selected
                                        ? 'var(--color-primary-50)'
                                        : hasEvents
                                            ? 'linear-gradient(180deg, #FFFBEB 0%, white 100%)'
                                            : 'white',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => {
                                    if (!selected) (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC';
                                }}
                                onMouseLeave={e => {
                                    if (!selected) (e.currentTarget as HTMLDivElement).style.background = hasEvents ? 'linear-gradient(180deg, #FFFBEB 0%, white 100%)' : 'white';
                                }}
                            >
                                {/* Day Number */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.3rem',
                                }}>
                                    <span style={{
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        transition: 'all 0.2s',
                                        ...(today ? {
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            boxShadow: '0 2px 8px rgba(12, 35, 64, 0.3)',
                                        } : selected ? {
                                            background: 'var(--color-gold)',
                                            color: 'white',
                                            boxShadow: 'var(--shadow-gold)',
                                        } : hasEvents ? {
                                            background: 'var(--color-gold)',
                                            color: 'white',
                                            boxShadow: '0 2px 6px rgba(240, 180, 41, 0.25)',
                                        } : {
                                            background: 'transparent',
                                            color: 'var(--color-text)',
                                        }),
                                    }}>
                                        {d}
                                    </span>
                                    {hasEvents && (
                                        <span style={{
                                            fontSize: '0.6rem',
                                            fontWeight: 800,
                                            color: 'var(--color-gold-dark)',
                                            background: '#FEF3C7',
                                            padding: '1px 6px',
                                            borderRadius: 'var(--radius-full)',
                                        }}>
                                            {dayEvents.length}
                                        </span>
                                    )}
                                </div>

                                {/* Event Pills */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {dayEvents.slice(0, 2).map(ev => {
                                        const cfg = statusConfig[ev.status] || statusConfig.PENDIENTE;
                                        return (
                                            <div key={ev.id} style={{
                                                fontSize: '0.6rem',
                                                fontWeight: 600,
                                                padding: '2px 5px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: cfg.bg,
                                                color: cfg.color,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: 1.3,
                                            }}>
                                                {ev.date.getHours()}:{ev.date.getMinutes().toString().padStart(2, '0')} {ev.clientName}
                                            </div>
                                        );
                                    })}
                                    {dayEvents.length > 2 && (
                                        <span style={{
                                            fontSize: '0.55rem',
                                            fontWeight: 800,
                                            color: 'var(--color-gold-dark)',
                                            textAlign: 'center',
                                        }}>
                                            +{dayEvents.length - 2} más
                                        </span>
                                    )}
                                </div>

                                {/* Selected indicator line */}
                                {selected && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-dark))',
                                        borderRadius: '3px 3px 0 0',
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ===== RIGHT: Detail Panel ===== */}
            {selectedDay !== null && (
                <div style={{
                    borderLeft: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FAFBFD',
                    animation: 'slideInRight 0.3s ease',
                }}>
                    {/* Panel Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--color-border-light)',
                        background: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                {monthNames[month]} {year}
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                                Día {selectedDay}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedDay(null)}
                            style={{
                                width: '32px', height: '32px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-muted)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Panel Content */}
                    <div style={{ flex: 1, padding: '1rem 1.5rem', overflowY: 'auto' }}>
                        {selectedDayEvents.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem 1rem',
                                color: 'var(--color-text-muted)',
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-light)' }}>
                                    Sin citas programadas
                                </div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    Este día está libre
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{
                                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem',
                                }}>
                                    {selectedDayEvents.length} cita{selectedDayEvents.length !== 1 ? 's' : ''} programada{selectedDayEvents.length !== 1 ? 's' : ''}
                                </div>

                                {selectedDayEvents.map(ev => {
                                    const cfg = statusConfig[ev.status] || statusConfig.PENDIENTE;
                                    return (
                                        <div key={ev.id} style={{
                                            background: 'white',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: '1rem',
                                            border: '1px solid var(--color-border-light)',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'all 0.2s',
                                        }}>
                                            {/* Time & Status */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                }}>
                                                    🕐 {ev.date.getHours()}:{ev.date.getMinutes().toString().padStart(2, '0')}
                                                </div>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    background: cfg.bg,
                                                    color: cfg.color,
                                                }}>
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            {/* Client Name */}
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 700,
                                                color: 'var(--color-text)',
                                                marginBottom: '0.25rem',
                                            }}>
                                                {ev.clientName}
                                            </div>

                                            {/* Service */}
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--color-text-light)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                            }}>
                                                <span style={{ color: 'var(--color-gold)' }}>⚖️</span>
                                                {ev.title || 'Consulta Legal'}
                                            </div>

                                            {/* Countdown Timer */}
                                            {(() => {
                                                const cd = getCountdown(ev.date);
                                                const isPast = ev.date.getTime() < now.getTime();
                                                return (
                                                    <div style={{
                                                        marginTop: '0.75rem',
                                                        padding: '0.6rem 0.75rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        background: isPast
                                                            ? 'linear-gradient(135deg, #F3F4F6, #E5E7EB)'
                                                            : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.6rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.15em',
                                                            color: isPast ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.6)',
                                                        }}>
                                                            {isPast ? '⏰ Cita finalizada' : '⏳ Tiempo restante'}
                                                        </div>
                                                        {isPast ? (
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: 700,
                                                                color: 'var(--color-text-light)',
                                                            }}>
                                                                Ya pasó
                                                            </div>
                                                        ) : cd ? (
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '0.5rem',
                                                                alignItems: 'center',
                                                            }}>
                                                                {cd.days > 0 && (
                                                                    <div style={{ textAlign: 'center' }}>
                                                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1 }}>
                                                                            {cd.days}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>días</div>
                                                                    </div>
                                                                )}
                                                                {cd.days > 0 && <span style={{ color: 'var(--color-gold)', fontSize: '1rem', fontWeight: 300 }}>:</span>}
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1 }}>
                                                                        {String(cd.hours).padStart(2, '0')}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>hrs</div>
                                                                </div>
                                                                <span style={{ color: 'var(--color-gold)', fontSize: '1rem', fontWeight: 300, animation: 'blink 1s step-end infinite' }}>:</span>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1 }}>
                                                                        {String(cd.minutes).padStart(2, '0')}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>min</div>
                                                                </div>
                                                                <span style={{ color: 'var(--color-gold)', fontSize: '1rem', fontWeight: 300, animation: 'blink 1s step-end infinite' }}>:</span>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                                                                        {String(cd.seconds).padStart(2, '0')}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>seg</div>
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Panel Footer: Legend */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid var(--color-border-light)',
                        background: 'white',
                    }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem',
                        }}>
                            {Object.entries(statusConfig).map(([key, cfg]) => (
                                <div key={key} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    fontSize: '0.6rem', fontWeight: 700, color: cfg.color,
                                }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: cfg.bg,
                                        border: `1px solid ${cfg.color}`,
                                    }} />
                                    {cfg.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

/* === Reusable Styles === */
const navBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
};

const emptyCellStyle: React.CSSProperties = {
    minHeight: '90px',
    padding: '0.4rem',
    borderRight: '1px solid var(--color-border-light)',
    borderBottom: '1px solid var(--color-border-light)',
    background: '#FAFBFD',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: '0.5rem',
    paddingTop: '0.5rem',
};
