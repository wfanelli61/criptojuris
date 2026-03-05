'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Calendar from '@/components/Calendar';

interface Appointment {
    id: string;
    message?: string;
    preferredDate?: string;
    status: string;
    createdAt: string;
    service: { id: string; name: string };
    client: { id: string; name: string; email: string; phone?: string };
}

export default function LawyerCitasPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const viewMode = searchParams.get('view') === 'calendar' ? 'CALENDAR' : 'LIST';

    const fetchAppointments = async () => {
        try {
            const data = await apiFetch('/lawyers/me/appointments');
            setAppointments(data.appointments);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, []);

    // ... (rest of functions remain the same)
    const changeStatus = async (id: string, status: string) => {
        const labels: Record<string, string> = { CONFIRMADA: 'aceptar', CANCELADA: 'rechazar', FINALIZADA: 'finalizar' };
        if (!confirm(`¿Está seguro de ${labels[status]} esta solicitud?`)) return;
        try {
            await apiFetch(`/lawyers/me/appointments/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });
            fetchAppointments();
        } catch (err: any) {
            alert(err.message || 'Error al cambiar estado');
        }
    };

    const handleChat = async (clientId: string) => {
        try {
            await apiFetch('/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({ targetUserId: clientId }),
            });
            router.push('/dashboard/chat');
        } catch (err: any) {
            alert(err.message || 'Error al iniciar el chat');
        }
    };

    const statusBadge = (status: string) => <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;

    const calendarEvents = appointments
        .filter(a => a.preferredDate)
        .map(a => ({
            id: a.id,
            title: a.service.name,
            date: new Date(a.preferredDate!),
            clientName: a.client.name,
            status: a.status
        }));

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                    {viewMode === 'CALENDAR' ? 'Mi Calendario' : 'Mis Citas y Agenda'}
                </h1>
            </div>

            {appointments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    No tienes citas asignadas actualmente.
                </div>
            ) : viewMode === 'CALENDAR' ? (
                <Calendar events={calendarEvents} />
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Email</th>
                                <th>Servicio</th>
                                <th>Fecha Preferida</th>
                                <th>Mensaje</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => (
                                <tr key={a.id}>
                                    <td style={{ fontWeight: 500 }}>{a.client.name}</td>
                                    <td style={{ fontSize: '0.85rem' }}>{a.client.email}</td>
                                    <td>{a.service.name}</td>
                                    <td>{a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message || '—'}</td>
                                    <td>{statusBadge(a.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                            {a.status === 'PENDIENTE' && (
                                                <>
                                                    <button onClick={() => changeStatus(a.id, 'CONFIRMADA')} className="btn btn-success btn-sm">Aceptar</button>
                                                    <button onClick={() => changeStatus(a.id, 'CANCELADA')} className="btn btn-danger btn-sm">Rechazar</button>
                                                </>
                                            )}
                                            {a.status === 'CONFIRMADA' && (
                                                <>
                                                    <button onClick={() => changeStatus(a.id, 'FINALIZADA')} className="btn btn-primary btn-sm">Finalizar</button>
                                                    <button onClick={() => changeStatus(a.id, 'CANCELADA')} className="btn btn-danger btn-sm">Cancelar</button>
                                                </>
                                            )}
                                            <button onClick={() => handleChat(a.client.id)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                💬 Chat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
