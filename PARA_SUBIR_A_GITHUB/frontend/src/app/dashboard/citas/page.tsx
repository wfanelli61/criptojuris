'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Calendar from '@/components/Calendar';

interface Appointment {
    id: string;
    message?: string;
    preferredDate?: string;
    status: string;
    createdAt: string;
    service: { id: string; name: string };
    lawyer?: { id: string; name: string; lawyerProfile?: { specialties: string[] } };
}

export default function ClientCitasPage() {
    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const viewMode = searchParams.get('view') === 'calendar' ? 'CALENDAR' : 'LIST';

    const fetchAppointments = async () => {
        try {
            const data = await apiFetch('/clients/me/appointments');
            setAppointments(data.appointments);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, []);

    const cancelAppointment = async (id: string) => {
        if (!confirm('¿Está seguro de cancelar esta solicitud?')) return;
        try {
            await apiFetch(`/clients/me/appointments/${id}/cancel`, { method: 'PUT' });
            fetchAppointments();
        } catch (err: any) {
            alert(err.message || 'Error al cancelar');
        }
    };

    const statusBadge = (status: string) => {
        const cls = `badge badge-${status.toLowerCase()}`;
        return <span className={cls}>{status}</span>;
    };

    const calendarEvents = appointments
        .filter(a => a.preferredDate)
        .map(a => ({
            id: a.id,
            title: a.service.name,
            date: new Date(a.preferredDate!),
            clientName: a.lawyer?.name || 'Sin asignar',
            status: a.status,
        }));

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                    {viewMode === 'CALENDAR' ? 'Mi Calendario' : 'Mis Solicitudes / Citas'}
                </h1>
            </div>

            {appointments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    No tienes solicitudes aún. <a href="/abogados" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Buscar un abogado</a>
                </div>
            ) : viewMode === 'CALENDAR' ? (
                <Calendar events={calendarEvents} />
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th>Abogado</th>
                                <th>Fecha Preferida</th>
                                <th>Estado</th>
                                <th>Mensaje</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => (
                                <tr key={a.id}>
                                    <td style={{ fontWeight: 500 }}>{a.service.name}</td>
                                    <td>{a.lawyer?.name || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin asignar</span>}</td>
                                    <td>{a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    <td>{statusBadge(a.status)}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message || '—'}</td>
                                    <td>
                                        {['PENDIENTE', 'CONFIRMADA'].includes(a.status) && (
                                            <button onClick={() => cancelAppointment(a.id)} className="btn btn-danger btn-sm">Cancelar</button>
                                        )}
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
