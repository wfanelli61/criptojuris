'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const AREA_COLOR: Record<string, { bg: string; color: string }> = {
 PENAL: { bg: 'rgba(248,113,113,0.18)', color: '#F87171' },
 CIVIL: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 LOPNA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
 CORPORATIVO: { bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
};
const STATUS_LABEL: Record<string, string> = {
 SOLICITUD: 'Solicitud', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
 PRESUPUESTO_APROBADO: 'Presupuesto aprobado', CONTRATO_FIRMADO: 'Contrato firmado',
 EN_CURSO: 'En curso', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
 SOLICITUD: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429' },
 PRESUPUESTO_ENVIADO: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429' },
 PRESUPUESTO_APROBADO: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
 CONTRATO_FIRMADO: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 EN_CURSO: { bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
 CERRADO: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
 CANCELADO: { bg: 'rgba(248,113,113,0.18)', color: '#F87171' },
};

export default function AdminCasosPage() {
 const [cases, setCases] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [filterArea, setFilterArea] = useState('');
 const [filterStatus, setFilterStatus] = useState('');
 const [search, setSearch] = useState('');

 useEffect(() => {
 const params = new URLSearchParams();
 if (filterArea) params.set('legalArea', filterArea);
 if (filterStatus) params.set('status', filterStatus);
 apiFetch(`/cases?limit=100&${params}`).then(d => setCases(d.cases || [])).catch(() => {}).finally(() => setLoading(false));
 }, [filterArea, filterStatus]);

 const filtered = cases.filter(c =>
 !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
 c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
 c.client?.name.toLowerCase().includes(search.toLowerCase())
 );

 const metrics = [
 { label: 'Total', value: cases.length, accent: '#60A5FA' },
 { label: 'En curso', value: cases.filter(c => c.status === 'EN_CURSO').length, accent: '#C084FC' },
 { label: 'Solicitudes', value: cases.filter(c => c.status === 'SOLICITUD').length, accent: '#F0B429' },
 { label: 'Cerrados', value: cases.filter(c => c.status === 'CERRADO').length, accent: 'rgba(255,255,255,0.35)' },
 ];

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div>
 <div style={{ marginBottom: '1.5rem' }}>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>Expedientes</h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Gestión global de todos los casos</p>
 </div>

 {/* Métricas */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
 {metrics.map(m => (
 <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.accent}30`, borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
 <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.accent }}>{m.value}</div>
 <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.45)' }}>{m.label}</div>
 </div>
 ))}
 </div>

 {/* Filtros */}
 <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
 <input className="form-input" placeholder="Buscar por título, expediente o cliente..."
 value={search} onChange={e => setSearch(e.target.value)}
 style={{ maxWidth: '280px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} />
 <select className="form-input" value={filterArea} onChange={e => setFilterArea(e.target.value)}
 style={{ maxWidth: '160px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}>
 <option value="">Todas las áreas</option>
 {['PENAL','CIVIL','LOPNA','CORPORATIVO'].map(a => <option key={a} value={a}>{a}</option>)}
 </select>
 <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
 style={{ maxWidth: '200px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}>
 <option value="">Todos los estados</option>
 {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
 </select>
 </div>

 {/* Tabla */}
 <div className="table-container">
 <table className="table">
 <thead>
 <tr>
 <th>Expediente</th>
 <th>Cliente</th>
 <th>Abogado</th>
 <th>Área</th>
 <th>Estado</th>
 <th>Fecha</th>
 </tr>
 </thead>
 <tbody>
 {filtered.length === 0 ? (
 <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>No se encontraron expedientes</td></tr>
 ) : filtered.map(c => {
 const area = AREA_COLOR[c.legalArea] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 const st = STATUS_COLOR[c.status] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 return (
 <tr key={c.id}>
 <td>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.88rem' }}>{c.title}</div>
 <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)' }}>{c.caseNumber}</div>
 </td>
 <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{c.client?.name || '—'}</td>
 <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{c.lawyer?.name || <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>Sin asignar</span>}</td>
 <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: area.bg, color: area.color }}>{c.legalArea}</span></td>
 <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: st.bg, color: st.color }}>{STATUS_LABEL[c.status]}</span></td>
 <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{new Date(c.createdAt).toLocaleDateString('es-VE')}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
}
