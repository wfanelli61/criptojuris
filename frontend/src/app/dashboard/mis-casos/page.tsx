'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { FolderIcon, PlusIcon, InboxIcon } from '@/components/Icons';

const AREA_LABEL: Record<string, string> = { PENAL: 'Penal', CIVIL: 'Civil', LOPNA: 'LOPNA', CORPORATIVO: 'Corporativo' };
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

export default function MisCasosPage() {
 const [cases, setCases] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('');

 useEffect(() => {
 apiFetch('/cases').then(d => setCases(d.cases)).catch(() => {}).finally(() => setLoading(false));
 }, []);

 const filtered = cases.filter(c =>
 !filter || c.status === filter || c.legalArea === filter
 );

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div>
 {/* Header */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
 <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429' }}>
 <FolderIcon size={20} />
 </div>
 <div>
 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Expedientes</p>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Mis Casos</h1>
 </div>
 </div>
 <Link href="/dashboard/mis-casos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#F0B429', color: '#F1F5F9', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
 <PlusIcon size={15} /> Nuevo caso
 </Link>
 </div>

 {/* Filtros */}
 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
 {['', 'EN_CURSO', 'SOLICITUD', 'CERRADO', 'PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO'].map(f => (
 <button key={f} onClick={() => setFilter(f)} style={{
 padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
 cursor: 'pointer', border: '1.5px solid',
 borderColor: filter === f ? 'rgba(240,180,41,0.6)' : 'rgba(255,255,255,0.1)',
 background: filter === f ? 'rgba(240,180,41,0.15)' : 'rgba(255,255,255,0.04)',
 color: filter === f ? '#F0B429' : 'rgba(255,255,255,0.5)',
 }}>
 {f === '' ? 'Todos' : STATUS_LABEL[f] || AREA_LABEL[f] || f}
 </button>
 ))}
 </div>

 {/* Lista */}
 {filtered.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
 <div style={{ color: 'rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
 <InboxIcon size={40} />
 </div>
 <h3 style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 600 }}>No tenés casos aún</h3>
 <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Solicitá asesoría legal y un abogado se asignará a tu caso.</p>
 <Link href="/dashboard/mis-casos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.4rem', background: '#F0B429', color: '#F1F5F9', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
 <PlusIcon size={15} /> Crear mi primer caso
 </Link>
 </div>
 ) : (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {filtered.map(c => {
 const area = AREA_COLOR[c.legalArea] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 const status = STATUS_COLOR[c.status] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 return (
 <Link key={c.id} href={`/dashboard/mis-casos/${c.id}`} style={{ textDecoration: 'none' }}>
 <div style={{
 background: 'rgba(255,255,255,0.04)', borderRadius: '0.9rem', padding: '1rem 1.25rem',
 border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer',
 transition: 'border-color 0.2s, background 0.2s',
 display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
 }}
 onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.2)'; }}
 onMouseLeave={(e: any) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
 >
 <div style={{
 width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
 background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429',
 }}>
 <FolderIcon size={18} />
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.92rem', marginBottom: '0.2rem' }}>{c.title}</div>
 <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)' }}>Exp. {c.caseNumber}</div>
 </div>
 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
 <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: area.bg, color: area.color }}>
 {AREA_LABEL[c.legalArea]}
 </span>
 <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: status.bg, color: status.color }}>
 {STATUS_LABEL[c.status]}
 </span>
 {c.lawyer && (
 <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>
 Abg. {c.lawyer.name}
 </span>
 )}
 </div>
 </div>
 </Link>
 );
 })}
 </div>
 )}
 </div>
 );
}
