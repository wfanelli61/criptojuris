'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
 SOLICITUD: 'Solicitud', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
 PRESUPUESTO_APROBADO: 'Presupuesto aprobado', CONTRATO_FIRMADO: 'Contrato firmado',
 EN_CURSO: 'En curso', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
};
const AREA_COLOR: Record<string, string> = {
 PENAL: '#F87171', CIVIL: '#60A5FA', LOPNA: '#34D399', CORPORATIVO: '#C084FC', GENERAL: 'rgba(255,255,255,0.55)',
};
const AREA_BG: Record<string, string> = {
 PENAL: 'rgba(248,113,113,0.18)', CIVIL: 'rgba(96,165,250,0.18)', LOPNA: 'rgba(52,211,153,0.18)', CORPORATIVO: 'rgba(192,132,252,0.18)', GENERAL: 'rgba(255,255,255,0.08)',
};

function BarChart({ data, maxValue, colorFn }: { data: { label: string; value: number }[]; maxValue: number; colorFn?: (label: string) => string }) {
 return (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
 {data.map(({ label, value }) => {
 const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
 const bg = colorFn ? colorFn(label) : '#1B4D8F';
 return (
 <div key={label}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
 <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{label}</span>
 <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F1F5F9' }}>{value}</span>
 </div>
 <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
 <div style={{ height: '100%', width: `${pct}%`, background: bg, borderRadius: '9999px', transition: 'width 0.6s ease' }} />
 </div>
 </div>
 );
 })}
 </div>
 );
}

function MonthChart({ data }: { data: { month: string; count: number }[] }) {
 const max = Math.max(...data.map(d => d.count), 1);
 const MONTHS_ES: Record<string, string> = {
 '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
 '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
 '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
 };
 return (
 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px', paddingBottom: '1.5rem', position: 'relative' }}>
 {data.map(({ month, count }) => {
 const pct = (count / max) * 100;
 const [, m] = month.split('-');
 return (
 <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', height: '100%', justifyContent: 'flex-end' }}>
 <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{count}</span>
 <div style={{ width: '100%', height: `${pct}%`, minHeight: '4px', background: 'linear-gradient(180deg, #60A5FA, #1B4D8F)', borderRadius: '4px 4px 0 0', transition: 'height 0.6s ease' }} />
 <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', position: 'absolute', bottom: 0 }}>{MONTHS_ES[m] || m}</span>
 </div>
 );
 })}
 </div>
 );
}

export default function AdminReportesPage() {
 const [summary, setSummary] = useState<any>(null);
 const [casesReport, setCasesReport] = useState<any>(null);
 const [lawyers, setLawyers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [exporting, setExporting] = useState('');

 useEffect(() => {
 Promise.all([
 apiFetch('/reports/summary').catch(() => null),
 apiFetch('/reports/cases').catch(() => null),
 apiFetch('/reports/lawyers').catch(() => ({ lawyers: [] })),
 ]).then(([s, c, l]) => {
 setSummary(s);
 setCasesReport(c);
 setLawyers(l?.lawyers || []);
 }).finally(() => setLoading(false));
 }, []);

 const handleExport = async (type: 'cases' | 'lawyers') => {
 setExporting(type);
 try {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/export/${type}`, {
 credentials: 'include',
 });
 const blob = await res.blob();
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = type === 'cases' ? 'expedientes.csv' : 'abogados.csv';
 a.click();
 URL.revokeObjectURL(url);
 } catch { alert('Error al exportar'); }
 finally { setExporting(''); }
 };

 const handlePrint = () => window.print();

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 const metricCards = summary ? [
 { label: 'Usuarios totales', value: summary.users.total, sub: `${summary.users.lawyers} abogados · ${summary.users.clients} clientes`, accent: '#60A5FA' },
 { label: 'Expedientes', value: summary.cases.total, sub: `${summary.cases.active} en curso · ${summary.cases.closed} cerrados`, accent: '#C084FC' },
 { label: 'Suscripciones activas', value: summary.subscriptions.active, sub: `de ${summary.subscriptions.total} totales`, accent: '#34D399' },
 { label: 'Tickets abiertos', value: summary.support.open, sub: `de ${summary.support.total} totales`, accent: '#F0B429' },
 { label: 'Artículos publicados', value: summary.content.blogPosts, sub: `${summary.content.norms} normas jurídicas`, accent: '#C084FC' },
 ] : [];

 const areaData = (casesReport?.byArea || []).map((a: any) => ({ label: a.area, value: a.count }));
 const statusData = (casesReport?.byStatus || []).map((s: any) => ({ label: STATUS_LABEL[s.status] || s.status, value: s.count }));
 const maxArea = Math.max(...areaData.map((d: any) => d.value), 1);
 const maxStatus = Math.max(...statusData.map((d: any) => d.value), 1);

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>Reportes y Estadísticas</h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Vista general del sistema al {new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
 </div>
 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
 <button onClick={() => handleExport('cases')} disabled={exporting === 'cases'} className="btn btn-secondary btn-sm">
 {exporting === 'cases' ? 'Exportando...' : '↓ CSV Expedientes'}
 </button>
 <button onClick={() => handleExport('lawyers')} disabled={exporting === 'lawyers'} className="btn btn-secondary btn-sm">
 {exporting === 'lawyers' ? 'Exportando...' : '↓ CSV Abogados'}
 </button>
 <button onClick={handlePrint} className="btn btn-secondary btn-sm">🖨 Imprimir</button>
 </div>
 </div>

 {/* Métricas principales */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
 {metricCards.map(m => (
 <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.accent}30`, borderRadius: '1rem', padding: '1.25rem' }}>
 <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: m.accent }}>{m.value}</div>
 <div style={{ fontSize: '0.78rem', fontWeight: 600, margin: '0.3rem 0 0.2rem', color: '#F1F5F9' }}>{m.label}</div>
 <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{m.sub}</div>
 </div>
 ))}
 </div>

 {/* Gráficas */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
 {/* Por área */}
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 1.25rem' }}>Expedientes por área</h3>
 <BarChart
 data={areaData}
 maxValue={maxArea}
 colorFn={label => AREA_BG[label] ? AREA_COLOR[label] : '#1B4D8F'}
 />
 </div>

 {/* Por estado */}
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 1.25rem' }}>Expedientes por estado</h3>
 <BarChart data={statusData} maxValue={maxStatus} />
 </div>

 {/* Por mes */}
 {casesReport?.byMonth?.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 1rem' }}>Casos nuevos (últimos 6 meses)</h3>
 <MonthChart data={casesReport.byMonth} />
 </div>
 )}
 </div>

 {/* Tabla de abogados */}
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
 <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Rendimiento por abogado</h3>
 </div>
 <div className="table-container" style={{ borderRadius: 0, border: 'none' }}>
 <table className="table">
 <thead>
 <tr>
 <th>Abogado</th>
 <th style={{ textAlign: 'center' }}>Total casos</th>
 <th style={{ textAlign: 'center' }}>En curso</th>
 <th style={{ textAlign: 'center' }}>Cerrados</th>
 <th style={{ textAlign: 'center' }}>Artículos</th>
 <th style={{ textAlign: 'center' }}>Tasa cierre</th>
 </tr>
 </thead>
 <tbody>
 {lawyers.length === 0 ? (
 <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>No hay abogados registrados</td></tr>
 ) : lawyers.sort((a, b) => b.totalCases - a.totalCases).map(l => {
 const closedRate = l.totalCases > 0 ? Math.round((l.closedCases / l.totalCases) * 100) : 0;
 return (
 <tr key={l.id}>
 <td>
 <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F1F5F9' }}>{l.name}</div>
 <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{l.email}</div>
 </td>
 <td style={{ textAlign: 'center', fontWeight: 700, color: '#F1F5F9' }}>{l.totalCases}</td>
 <td style={{ textAlign: 'center' }}>
 <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(192,132,252,0.18)', color: '#C084FC' }}>{l.activeCases}</span>
 </td>
 <td style={{ textAlign: 'center' }}>
 <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}>{l.closedCases}</span>
 </td>
 <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{l.blogPosts}</td>
 <td style={{ textAlign: 'center' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
 <div style={{ width: '48px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
 <div style={{ height: '100%', width: `${closedRate}%`, background: closedRate > 60 ? '#10B981' : closedRate > 30 ? '#F59E0B' : '#EF4444', borderRadius: '9999px' }} />
 </div>
 <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{closedRate}%</span>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
