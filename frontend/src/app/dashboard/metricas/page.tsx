'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { FolderIcon, RefreshIcon, CheckIcon, CreditCardIcon, FileIcon, CalendarIcon, CpuIcon, TrendingIcon, BarChartIcon } from '@/components/Icons';

const AREA_COLOR: Record<string, string> = {
 PENAL: '#F87171', CIVIL: '#60A5FA', LOPNA: '#C084FC',
 CORPORATIVO: '#F0B429', GENERAL: 'rgba(255,255,255,0.3)',
};
const STATUS_LABEL: Record<string, string> = {
 SOLICITUD: 'Solicitud', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
 PRESUPUESTO_APROBADO: 'Aprobado', CONTRATO_FIRMADO: 'Contrato firmado',
 EN_CURSO: 'En curso', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
};

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent: string }) {
 return (
 <div style={{
 background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.07)',
 padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
 borderLeft: `3px solid ${accent}`,
 }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
 <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>
 </div>
 <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>{value}</div>
 {sub && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
 </div>
 );
}

export default function MetricasPage() {
 const [cases, setCases] = useState<any[]>([]);
 const [appointments, setAppointments] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 Promise.all([
 apiFetch('/cases').catch(() => ({ cases: [] })),
 apiFetch('/clients/me/appointments').catch(() => ({ appointments: [] })),
 ]).then(([c, a]) => {
 setCases(c.cases || []);
 setAppointments(a.appointments || []);
 }).finally(() => setLoading(false));
 }, []);

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 const totalCases = cases.length;
 const activeCases = cases.filter(c => !['CERRADO', 'CANCELADO'].includes(c.status)).length;
 const closedCases = cases.filter(c => c.status === 'CERRADO').length;

 const totalSpent = cases
 .filter(c => c.budget?.status === 'APROBADO')
 .reduce((sum: number, c: any) => sum + (c.budget?.amount || 0), 0);

 const totalDocs = cases.reduce((sum: number, c: any) => sum + (c.documents?.length || 0), 0);

 const areaCount: Record<string, number> = {};
 cases.forEach(c => { areaCount[c.legalArea] = (areaCount[c.legalArea] || 0) + 1; });
 const areaEntries = Object.entries(areaCount).sort((a, b) => b[1] - a[1]);

 const statusCount: Record<string, number> = {};
 cases.forEach(c => { statusCount[c.status] = (statusCount[c.status] || 0) + 1; });

 const pendingAppts = appointments.filter(a => a.status === 'PENDIENTE').length;
 const confirmedAppts = appointments.filter(a => a.status === 'CONFIRMADA').length;

 const recentCases = [...cases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

 return (
 <div style={{ maxWidth: '900px', margin: '0 auto' }}>
 <div style={{ marginBottom: '2rem' }}>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
 Mi Dashboard
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem' }}>Resumen completo de tu actividad en la plataforma</p>
 </div>

 {/* Métricas principales */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
 <StatCard icon={<FolderIcon size={18} />}    label="Casos totales"   value={totalCases}                             accent="#60A5FA" />
 <StatCard icon={<RefreshIcon size={18} />}   label="Casos activos"   value={activeCases}                            accent="#60A5FA" />
 <StatCard icon={<CheckIcon size={18} />}     label="Casos cerrados"  value={closedCases}                            accent="#34D399" />
 <StatCard icon={<CreditCardIcon size={18}/>} label="Total invertido" value={`$${totalSpent.toLocaleString()}`} sub="En honorarios aprobados" accent="#F0B429" />
 <StatCard icon={<FileIcon size={18} />}      label="Documentos"      value={totalDocs}  sub="En todos tus casos"   accent="#C084FC" />
 <StatCard icon={<CalendarIcon size={18} />}  label="Citas agendadas" value={appointments.length} sub={`${pendingAppts} pendientes · ${confirmedAppts} confirmadas`} accent="#F0B429" />
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
 {/* Distribución por área */}
 {areaEntries.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem' }}>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.92rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <BarChartIcon size={15} stroke="#F0B429" /> Casos por área jurídica
 </div>
 <div style={{ display: 'grid', gap: '0.6rem' }}>
 {areaEntries.map(([area, count]) => (
 <div key={area}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{area}</span>
 <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{count} caso{count !== 1 ? 's' : ''}</span>
 </div>
 <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '9999px', overflow: 'hidden' }}>
 <div style={{
 height: '100%', borderRadius: '9999px',
 background: AREA_COLOR[area] || '#6B7280',
 width: `${(count / totalCases) * 100}%`,
 transition: 'width 0.6s ease',
 }} />
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Estado de casos */}
 {Object.keys(statusCount).length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem' }}>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.92rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <TrendingIcon size={15} stroke="#60A5FA" /> Estado de expedientes
 </div>
 <div style={{ display: 'grid', gap: '0.5rem' }}>
 {Object.entries(statusCount).map(([status, count]) => (
 <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
 <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{STATUS_LABEL[status] || status}</span>
 <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem' }}>{count}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Casos recientes */}
 {recentCases.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: '1.25rem' }}>
 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <FolderIcon size={14} stroke="#F0B429" /> Actividad reciente
 </span>
 <Link href="/dashboard/mis-casos" style={{ fontSize: '0.78rem', color: '#F0B429', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</Link>
 </div>
 <div style={{ padding: '0.75rem 1.5rem', display: 'grid', gap: '0.4rem' }}>
 {recentCases.map(c => (
 <Link key={c.id} href={`/dashboard/mis-casos/${c.id}`} style={{ textDecoration: 'none' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', transition: 'background 0.15s' }}
 onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
 onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}>
 <div>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.85rem' }}>{c.title}</div>
 <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>{c.caseNumber} · {c.legalArea}</div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
 <span style={{
 padding: '0.18rem 0.55rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
 background: c.status === 'CERRADO' ? 'rgba(52,211,153,0.15)' : c.status === 'CANCELADO' ? 'rgba(248,113,113,0.15)' : 'rgba(96,165,250,0.15)',
 color: c.status === 'CERRADO' ? '#34D399' : c.status === 'CANCELADO' ? '#F87171' : '#60A5FA',
 }}>
 {STATUS_LABEL[c.status]}
 </span>
 <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
 {new Date(c.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Accesos rápidos a IA */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
 <Link href="/dashboard/analisis-ia" style={{ textDecoration: 'none' }}>
 <div style={{ background: 'linear-gradient(135deg,#0C2340,#1B4D8F)', borderRadius: '1rem', padding: '1.5rem', color: '#fff', cursor: 'pointer', transition: 'transform 0.2s' }}
 onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
 onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
 <div style={{ marginBottom: '0.6rem', opacity: 0.8 }}>
 <CpuIcon size={28} stroke="#F0B429" />
 </div>
 <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Análisis IA de tu caso</div>
 <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Describe tu situación y obtén una orientación legal preliminar</div>
 </div>
 </Link>
 <Link href="/dashboard/generar-documento" style={{ textDecoration: 'none' }}>
 <div style={{ background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', borderRadius: '1rem', padding: '1.5rem', color: '#fff', cursor: 'pointer', transition: 'transform 0.2s' }}
 onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
 onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
 <div style={{ marginBottom: '0.6rem', opacity: 0.8 }}>
 <FileIcon size={28} stroke="#E9D5FF" />
 </div>
 <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Generador de documentos</div>
 <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Genera poderes, contratos y cartas legales con IA</div>
 </div>
 </Link>
 </div>
 </div>
 );
}
