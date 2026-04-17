'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Metrics {
    totalUsers: number;
    totalLawyers: number;
    totalClients: number;
    totalAppointments: number;
    pendingAppointments: number;
    totalServices: number;
    totalTestimonials: number;
}

interface Appointment {
    id: string;
    message?: string;
    preferredDate?: string;
    status: string;
    createdAt: string;
    service: { id: string; name: string };
    client?: { id: string; name: string; email: string };
    lawyer?: { id: string; name: string };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                if (user.role === 'ADMIN') {
                    const data = await apiFetch('/admin/metrics');
                    setMetrics(data.metrics);
                    const apptData = await apiFetch('/admin/appointments?limit=5');
                    setAppointments(apptData.appointments || []);
                } else if (user.role === 'ABOGADO') {
                    const data = await apiFetch('/lawyers/me/appointments');
                    setAppointments(data.appointments || []);
                } else {
                    const data = await apiFetch('/clients/me/appointments');
                    setAppointments(data.appointments || []);
                }
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="spinner" />;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const pendingCount = appointments.filter(a => a.status === 'PENDIENTE').length;
    const confirmedCount = appointments.filter(a => a.status === 'CONFIRMADA').length;
    const totalCount = appointments.length;

    const statusBadge = (status: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            PENDIENTE: { bg: '#FEF3C7', color: '#92400E' },
            CONFIRMADA: { bg: '#D1FAE5', color: '#065F46' },
            CANCELADA: { bg: '#FEE2E2', color: '#991B1B' },
            FINALIZADA: { bg: '#DBEAFE', color: '#1E40AF' },
        };
        const c = colors[status] || { bg: '#F3F4F6', color: '#374151' };
        return (
            <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem',
                fontWeight: 600, background: c.bg, color: c.color,
            }}>
                {status}
            </span>
        );
    };

    return (
        <div>
            {/* Greeting */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '1.75rem', color: 'var(--color-primary-dark)',
                    fontFamily: 'var(--font-heading)', marginBottom: '0.3rem',
                }}>
                    {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                    {user?.role === 'ADMIN' && 'Aquí tienes un resumen de la plataforma.'}
                    {user?.role === 'ABOGADO' && 'Aquí tienes un resumen de tu actividad.'}
                    {user?.role === 'CLIENTE' && 'Aquí tienes un resumen de tus solicitudes.'}
                </p>
            </div>

            {/* Admin Metrics */}
            {user?.role === 'ADMIN' && metrics && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '1rem', marginBottom: '2rem',
                }}>
                    {[
                        { label: 'Total Usuarios', value: metrics.totalUsers, bg: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 100%)' },
                        { label: 'Abogados', value: metrics.totalLawyers, bg: 'linear-gradient(135deg, #1B4D8F 0%, #0C2340 100%)' },
                        { label: 'Clientes', value: metrics.totalClients, bg: 'linear-gradient(135deg, #060F1D 0%, #1B4D8F 100%)' },
                        { label: 'Citas Totales', value: metrics.totalAppointments, bg: 'linear-gradient(135deg, #122D4F 0%, #060F1D 100%)' },
                        { label: 'Pendientes', value: metrics.pendingAppointments, bg: 'linear-gradient(135deg, #0C2340 0%, #122D4F 100%)' },
                        { label: 'Servicios', value: metrics.totalServices, bg: 'linear-gradient(135deg, #1B4D8F 0%, #060F1D 100%)' },
                    ].map((m) => (
                        <div key={m.label} style={{
                            background: m.bg, borderRadius: '16px', padding: '1.25rem',
                            color: 'white', position: 'relative', overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {m.label}
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                                {m.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client/Lawyer Summary Cards */}
            {user?.role !== 'ADMIN' && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem', marginBottom: '2rem',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 100%)',
                        borderRadius: '16px', padding: '1.25rem', color: 'white',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Citas
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{totalCount}</div>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, #1B4D8F 0%, #0C2340 100%)',
                        borderRadius: '16px', padding: '1.25rem', color: 'white',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Pendientes
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{pendingCount}</div>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, #060F1D 0%, #1B4D8F 100%)',
                        borderRadius: '16px', padding: '1.25rem', color: 'white',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Confirmadas
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{confirmedCount}</div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                    fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem',
                    fontWeight: 600,
                }}>
                    ⚡ Acciones Rápidas
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {user?.role === 'CLIENTE' && (
                        <>
                            <Link href="/abogados" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                🔍 Buscar Abogado
                            </Link>
                            <Link href="/dashboard/citas" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                📅 Ver Mis Citas
                            </Link>
                            <Link href="/dashboard/chat" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                💬 Mis Mensajes
                            </Link>
                        </>
                    )}
                    {user?.role === 'ABOGADO' && (
                        <>
                            <Link href="/dashboard/mis-citas" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                📅 Ver Mis Citas
                            </Link>
                            <Link href="/dashboard/mi-perfil" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                👤 Editar Perfil
                            </Link>
                            <Link href="/dashboard/chat" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                💬 Mensajes
                            </Link>
                        </>
                    )}
                    {user?.role === 'ADMIN' && (
                        <>
                            <Link href="/dashboard/admin/usuarios" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                👥 Gestionar Usuarios
                            </Link>
                            <Link href="/dashboard/admin/verificaciones" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                🛡️ Verificaciones
                            </Link>
                            <Link href="/dashboard/admin/citas" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                📅 Gestionar Citas
                            </Link>
                            <Link href="/dashboard/admin/servicios" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                📋 Servicios
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Appointments */}
            <div>
                <h2 style={{
                    fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem',
                    fontWeight: 600,
                }}>
                    📋 {user?.role === 'ADMIN' ? 'Últimas Citas' : 'Mis Últimas Citas'}
                </h2>

                {appointments.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                        <p style={{ fontSize: '0.9rem' }}>No hay citas registradas aún.</p>
                        {user?.role === 'CLIENTE' && (
                            <Link href="/abogados" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
                                Buscar un abogado
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-container" style={{ margin: 0 }}>
                            <table className="table" style={{ marginBottom: 0 }}>
                                <thead>
                                    <tr>
                                        {user?.role === 'ADMIN' && <th>Cliente</th>}
                                        {(user?.role === 'ADMIN' || user?.role === 'CLIENTE') && <th>Abogado</th>}
                                        {user?.role === 'ABOGADO' && <th>Cliente</th>}
                                        <th>Servicio</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.slice(0, 5).map((a) => (
                                        <tr key={a.id}>
                                            {user?.role === 'ADMIN' && <td style={{ fontWeight: 500 }}>{a.client?.name || '—'}</td>}
                                            {(user?.role === 'ADMIN' || user?.role === 'CLIENTE') && (
                                                <td>{a.lawyer?.name || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Sin asignar</span>}</td>
                                            )}
                                            {user?.role === 'ABOGADO' && <td style={{ fontWeight: 500 }}>{a.client?.name || '—'}</td>}
                                            <td>{a.service?.name || '—'}</td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {a.preferredDate
                                                    ? new Date(a.preferredDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : '—'
                                                }
                                            </td>
                                            <td>{statusBadge(a.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {appointments.length > 5 && (
                            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
                                <Link href={user?.role === 'ABOGADO' ? '/dashboard/mis-citas' : user?.role === 'ADMIN' ? '/dashboard/admin/citas' : '/dashboard/citas'}
                                    style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                    Ver todas las citas →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
