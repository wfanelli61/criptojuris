'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function AdminVerificacionesPage() {
 const [data, setData] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [filterStatus, setFilterStatus] = useState('PENDING');

 const fetchData = () => {
 setLoading(true);
 apiFetch(`/admin/verifications?status=${filterStatus}`)
 .then(setData)
 .catch(() => { })
 .finally(() => setLoading(false));
 };

 useEffect(() => { fetchData(); }, [filterStatus]);

 if (loading) return <div className="spinner" />;

 const verifications = data?.verifications || [];

 const statusBadge = (status: string) => {
 const colors: any = {
 PENDING: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429', label: ' Pendiente' },
 APPROVED: { bg: 'rgba(52,211,153,0.18)', color: '#34D399', label: ' Aprobado' },
 REJECTED: { bg: 'rgba(248,113,113,0.18)', color: '#F87171', label: ' Rechazado' },
 };
 const c = colors[status] || colors.PENDING;
 return (
 <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.color }}>
 {c.label}
 </span>
 );
 };

 return (
 <div>
 <h1 style={{ fontSize: '1.5rem', color: '#F1F5F9', marginBottom: '1rem' }}> Solicitudes de Verificación</h1>

 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
 {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
 <button key={s} onClick={() => setFilterStatus(s)} style={{
 padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
 border: filterStatus === s ? '2px solid #F0B429' : '1px solid rgba(255,255,255,0.12)',
 background: filterStatus === s ? 'rgba(240,180,41,0.15)' : 'rgba(255,255,255,0.05)',
 color: filterStatus === s ? '#F0B429' : 'rgba(255,255,255,0.65)',
 fontWeight: filterStatus === s ? 600 : 400,
 }}>
 {s === 'PENDING' ? ' Pendientes' : s === 'APPROVED' ? ' Aprobados' : ' Rechazados'}
 </button>
 ))}
 </div>

 {verifications.length === 0 ? (
 <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
 No hay solicitudes con este estado.
 </div>
 ) : (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {verifications.map((v: any) => (
 <Link key={v.id} href={`/dashboard/admin/verificaciones/${v.id}`} style={{ textDecoration: 'none' }}>
 <div className="card" style={{
 padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between',
 alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s',
 }}>
 <div>
 <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{v.user?.name || 'Sin nombre'}</strong>
 <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.2rem' }}>
 {v.user?.email} • {new Date(v.updatedAt).toLocaleDateString('es')}
 </p>
 </div>
 {statusBadge(v.verificationStatus)}
 </div>
 </Link>
 ))}
 </div>
 )}
 </div>
 );
}
