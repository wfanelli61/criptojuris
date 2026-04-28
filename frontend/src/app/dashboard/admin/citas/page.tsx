'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminCitasPage() {
 const [appointments, setAppointments] = useState<any[]>([]);
 const [lawyers, setLawyers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [statusFilter, setStatusFilter] = useState('');

 const fetchData = async () => {
 try {
 const params = new URLSearchParams({ limit: '50' });
 if (statusFilter) params.set('status', statusFilter);
 const [apptData, lawyerData] = await Promise.all([
 apiFetch(`/admin/appointments?${params.toString()}`),
 apiFetch('/admin/lawyers?limit=50'),
 ]);
 setAppointments(apptData.appointments);
 setLawyers(lawyerData.lawyers);
 } catch { }
 setLoading(false);
 };

 useEffect(() => { fetchData(); }, []);

 const updateAppointment = async (id: string, data: any) => {
 try {
 await apiFetch(`/admin/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
 fetchData();
 } catch (err: any) {
 alert(err.message || 'Error');
 }
 };

 const statusBadge = (status: string) => <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;

 if (loading) return <div className="spinner" />;

 return (
 <div>
 <h1 style={{ fontSize: '1.6rem', color: '#F1F5F9', marginBottom: '1.5rem' }}>Gestión de Citas</h1>

 {/* Filter */}
 <div className="dash-filters">
 <select className="form-input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }}>
 <option value="">Todos los estados</option>
 <option value="PENDIENTE">Pendiente</option>
 <option value="CONFIRMADA">Confirmada</option>
 <option value="CANCELADA">Cancelada</option>
 <option value="FINALIZADA">Finalizada</option>
 </select>
 <button onClick={() => { setLoading(true); fetchData(); }} className="btn btn-secondary">Filtrar</button>
 </div>

 <div className="table-container">
 <table className="table">
 <thead>
 <tr><th>Cliente</th><th>Abogado</th><th className="col-hide-mobile">Servicio</th><th className="col-hide-mobile">Fecha</th><th className="col-hide-mobile">Mensaje</th><th>Estado</th><th>Acciones</th></tr>
 </thead>
 <tbody>
 {appointments.map((a) => (
 <tr key={a.id}>
 <td style={{ fontWeight: 500 }}>{a.client?.name || '—'}</td>
 <td>
 <select className="form-input" value={a.lawyerId || ''} onChange={(e) => updateAppointment(a.id, { lawyerId: e.target.value || null })}
 style={{ padding: '0.25rem', fontSize: '0.8rem', width: '100%', minWidth: '100px', maxWidth: '160px' }}>
 <option value="">Sin asignar</option>
 {lawyers.map((l) => (
 <option key={l.id} value={l.id}>{l.name}</option>
 ))}
 </select>
 </td>
 <td className="col-hide-mobile">{a.service?.name || '—'}</td>
 <td className="col-hide-mobile" style={{ fontSize: '0.85rem' }}>
 {a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </td>
 <td className="col-hide-mobile" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message || '—'}</td>
 <td>{statusBadge(a.status)}</td>
 <td>
 <select className="form-input" value={a.status} onChange={(e) => updateAppointment(a.id, { status: e.target.value })}
 style={{ padding: '0.25rem', fontSize: '0.8rem', width: '100%', minWidth: '90px', maxWidth: '130px' }}>
 <option value="PENDIENTE">Pendiente</option>
 <option value="CONFIRMADA">Confirmada</option>
 <option value="CANCELADA">Cancelada</option>
 <option value="FINALIZADA">Finalizada</option>
 </select>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
