'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { FolderIcon, InboxIcon, CheckIcon } from '@/components/Icons';

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

export default function CasosAbogadoPage() {
 const [misCasos, setMisCasos] = useState<any[]>([]);
 const [sinAsignar, setSinAsignar] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState<'mis' | 'nuevos'>('mis');
 const [assigningId, setAssigningId] = useState('');

 const load = async () => {
 const [mine, unassigned] = await Promise.all([
 apiFetch('/cases').catch(() => ({ cases: [] })),
 apiFetch('/cases?view=unassigned').catch(() => ({ cases: [] })),
 ]);
 setMisCasos(mine.cases || []);
 setSinAsignar(unassigned.cases || []);
 setLoading(false);
 };
 useEffect(() => { load(); }, []);

 const asignarme = async (caseId: string) => {
 setAssigningId(caseId);
 try {
 await apiFetch(`/cases/${caseId}/assign`, { method: 'PATCH' });
 await load();
 setTab('mis');
 } catch (e: any) { alert(e.message); }
 finally { setAssigningId(''); }
 };

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 const lista = tab === 'mis' ? misCasos : sinAsignar;

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
 <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429' }}>
 <FolderIcon size={20} />
 </div>
 <div>
 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Gestión</p>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Expedientes</h1>
 </div>
 </div>

 {/* Tabs */}
 <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem', borderRadius: '0.75rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.07)' }}>
 {[
 { key: 'mis', label: `Mis casos (${misCasos.length})` },
 { key: 'nuevos', label: `Solicitudes nuevas (${sinAsignar.length})` },
 ].map(t => (
 <button key={t.key} onClick={() => setTab(t.key as any)} style={{
 padding: '0.5rem 1.1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
 border: 'none', cursor: 'pointer',
 background: tab === t.key ? 'rgba(240,180,41,0.15)' : 'transparent',
 color: tab === t.key ? '#F0B429' : 'rgba(255,255,255,0.45)',
 }}>{t.label}</button>
 ))}
 </div>

 {lista.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
 <div style={{ color: 'rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
 {tab === 'mis' ? <InboxIcon size={40} /> : <CheckIcon size={40} />}
 </div>
 <p style={{ color: 'rgba(255,255,255,0.35)' }}>
 {tab === 'mis' ? 'No tenés casos asignados aún' : 'No hay solicitudes nuevas por el momento'}
 </p>
 </div>
 ) : (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {lista.map(c => {
 const area = AREA_COLOR[c.legalArea] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 const status = STATUS_COLOR[c.status] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 return (
 <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.9rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
 <div style={{
 width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
 background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429',
 }}>
 <FolderIcon size={18} />
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.92rem' }}>{c.title}</div>
 <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>
 Exp. {c.caseNumber} · Cliente: {c.client?.name}
 </div>
 </div>
 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
 <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: area.bg, color: area.color }}>
 {c.legalArea}
 </span>
 <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: status.bg, color: status.color }}>
 {STATUS_LABEL[c.status]}
 </span>
 {tab === 'nuevos' ? (
 <button onClick={() => asignarme(c.id)} className="btn btn-primary btn-sm" disabled={assigningId === c.id}>
 {assigningId === c.id ? '...' : 'Tomar caso'}
 </button>
 ) : (
 <Link href={`/dashboard/casos/${c.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
 Ver expediente
 </Link>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
