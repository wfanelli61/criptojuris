'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
    id: string;
    message?: string;
    preferredDate?: string;
    status: string;
    createdAt: string;
    service: { name: string };
    client?: { name: string };
    lawyer?: { name: string };
}

export default function GenerarReportePage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [selectedId, setSelectedId] = useState('');
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(false);
    const [reporte, setReporte] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const endpoint = user?.role === 'ABOGADO' ? '/lawyers/me/appointments' : '/clients/me/appointments';
                const data = await apiFetch(endpoint);
                setAppointments(data.appointments || []);
            } catch { }
            setLoadingAppts(false);
        };
        if (user) fetchAppointments();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setReporte('');
        setLoading(true);
        try {
            const data = await apiFetch('/ai/generar-reporte', {
                method: 'POST',
                body: JSON.stringify({
                    appointmentId: selectedId,
                    notasAdicionales: notas.trim() || undefined,
                }),
            });
            setReporte(data.reporte);
        } catch (err: any) {
            setError(err.message || 'Error al generar el reporte. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDescargar = () => {
        const appt = appointments.find(a => a.id === selectedId);
        const filename = `reporte-${appt?.service?.name?.replace(/\s+/g, '-') ?? 'consulta'}-${new Date().toISOString().slice(0, 10)}.txt`;
        const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada',
            CANCELADA: 'Cancelada', FINALIZADA: 'Finalizada',
        };
        return map[s] || s;
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
                    📄 Generar Reporte de Consulta
                </h1>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                    Selecciona una consulta y la IA generará un reporte legal formal que puedes descargar.
                </p>
            </div>

            {!reporte ? (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                                Selecciona una consulta *
                            </label>
                            {loadingAppts ? (
                                <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Cargando consultas...</div>
                            ) : appointments.length === 0 ? (
                                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#6B7280', fontSize: '0.875rem', textAlign: 'center' }}>
                                    No tienes consultas registradas aún.{' '}
                                    <a href="/abogados" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Solicita una consulta</a>
                                </div>
                            ) : (
                                <select
                                    value={selectedId}
                                    onChange={e => setSelectedId(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '0.65rem 0.85rem',
                                        border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem', color: '#374151', background: '#fff',
                                        outline: 'none',
                                    }}
                                >
                                    <option value="">-- Selecciona una consulta --</option>
                                    {appointments.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.service.name} — {statusLabel(a.status)} —{' '}
                                            {a.preferredDate
                                                ? new Date(a.preferredDate).toLocaleDateString('es-VE')
                                                : new Date(a.createdAt).toLocaleDateString('es-VE')}
                                            {user?.role === 'ABOGADO' && a.client ? ` — ${a.client.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                                Notas adicionales (opcional)
                            </label>
                            <textarea
                                value={notas}
                                onChange={e => setNotas(e.target.value)}
                                placeholder="Agrega observaciones, acuerdos, o información adicional relevante para el reporte..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem', color: '#374151', resize: 'vertical',
                                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !selectedId}
                            className="btn btn-primary"
                            style={{ padding: '0.85rem', fontSize: '0.95rem', opacity: (loading || !selectedId) ? 0.6 : 1 }}
                        >
                            {loading ? '🔄 Generando reporte...' : '📄 Generar Reporte'}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 600, color: '#10B981' }}>✅ Reporte generado exitosamente</span>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleDescargar} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                                ⬇️ Descargar .txt
                            </button>
                            <button
                                onClick={() => { setReporte(''); setSelectedId(''); setNotas(''); }}
                                className="btn"
                                style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', background: '#F0F2F7', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            >
                                + Nuevo Reporte
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <pre style={{
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            fontFamily: 'monospace', fontSize: '0.82rem',
                            color: '#374151', lineHeight: 1.7, margin: 0,
                            maxHeight: '60vh', overflowY: 'auto',
                        }}>
                            {reporte}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
