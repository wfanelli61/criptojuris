'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Calendar from '@/components/Calendar';
import { CalendarIcon, CheckIcon, XIcon, MessageIcon, InboxIcon } from '@/components/Icons';

interface Appointment {
 id: string;
 message?: string;
 preferredDate?: string;
 status: string;
 createdAt: string;
 service: { id: string; name: string };
 client: { id: string; name: string; email: string; phone?: string };
}

const STATUS: Record<string, { label: string; color: string; dot: string }> = {
 PENDIENTE:  { label: 'Pendiente',  color: '#FBBF24', dot: '#F59E0B' },
 CONFIRMADA: { label: 'Confirmada', color: '#34D399', dot: '#10B981' },
 CANCELADA:  { label: 'Cancelada',  color: '#F87171', dot: '#EF4444' },
 FINALIZADA: { label: 'Finalizada', color: '#60A5FA', dot: '#3B82F6' },
};

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

 const badge = (status: string) => {
 const s = STATUS[status] || { label: status, color: '#94A3B8', dot: '#94A3B8' };
 return (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: s.color }}>
 <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
 {s.label}
 </span>
 );
 };

 const calendarEvents = appointments
 .filter(a => a.preferredDate)
 .map(a => ({
 id: a.id,
 title: a.service.name,
 date: new Date(a.preferredDate!),
 clientName: a.client.name,
 status: a.status,
 }));

 if (loading) return <div className="spinner" />;

 return (
 <div style={{ maxWidth: 1060, margin: '0 auto', color: '#E2E8F0' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
 <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429' }}>
 <CalendarIcon size={20} />
 </div>
 <div>
 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Agenda</p>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
 {viewMode === 'CALENDAR' ? 'Mi Calendario' : 'Citas y Agenda'}
 </h1>
 </div>
 </div>

 {appointments.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
 <div style={{ color: 'rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
 <InboxIcon size={40} />
 </div>
 <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>No tienes citas asignadas actualmente.</p>
 </div>
 ) : viewMode === 'CALENDAR' ? (
 <Calendar events={calendarEvents} />
 ) : (
 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
 <thead>
 <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
 {['Cliente', 'Email', 'Servicio', 'Fecha', 'Mensaje', 'Estado', 'Acciones'].map(h => (
 <th key={h} style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.09em', whiteSpace: 'nowrap' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {appointments.map(a => (
 <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
 onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
 onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
 <td style={{ padding: '0.9rem 0.75rem', color: '#F1F5F9', fontWeight: 600 }}>{a.client.name}</td>
 <td style={{ padding: '0.9rem 0.75rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{a.client.email}</td>
 <td style={{ padding: '0.9rem 0.75rem', color: 'rgba(255,255,255,0.7)' }}>{a.service.name}</td>
 <td style={{ padding: '0.9rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem' }}>
 {a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
 </td>
 <td style={{ padding: '0.9rem 0.75rem', color: 'rgba(255,255,255,0.45)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message || '—'}</td>
 <td style={{ padding: '0.9rem 0.75rem' }}>{badge(a.status)}</td>
 <td style={{ padding: '0.9rem 0.75rem' }}>
 <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
 {a.status === 'PENDIENTE' && (
 <>
 <button onClick={() => changeStatus(a.id, 'CONFIRMADA')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399', borderRadius: '0.4rem', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
 <CheckIcon size={12} /> Aceptar
 </button>
 <button onClick={() => changeStatus(a.id, 'CANCELADA')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', borderRadius: '0.4rem', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
 <XIcon size={12} /> Rechazar
 </button>
 </>
 )}
 {a.status === 'CONFIRMADA' && (
 <>
 <button onClick={() => changeStatus(a.id, 'FINALIZADA')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA', borderRadius: '0.4rem', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
 <CheckIcon size={12} /> Finalizar
 </button>
 <button onClick={() => changeStatus(a.id, 'CANCELADA')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', borderRadius: '0.4rem', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
 <XIcon size={12} /> Cancelar
 </button>
 </>
 )}
 <button onClick={() => handleChat(a.client.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', borderRadius: '0.4rem', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
 <MessageIcon size={12} /> Chat
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 );
}
