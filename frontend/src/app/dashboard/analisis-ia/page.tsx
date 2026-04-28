'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { CpuIcon, RefreshIcon, FolderIcon, AlertIcon, ShieldIcon, ArrowRightIcon, CheckIcon } from '@/components/Icons';

const AREAS = ['', 'PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO', 'LABORAL', 'ADMINISTRATIVO'];
const AREA_LABEL: Record<string, string> = {
 PENAL: 'Derecho Penal', CIVIL: 'Derecho Civil', LOPNA: 'LOPNA / Familia',
 CORPORATIVO: 'Corporativo / Mercantil', LABORAL: 'Derecho Laboral', ADMINISTRATIVO: 'Derecho Administrativo',
};
const GRAVEDAD_COLOR: Record<string, { bg: string; color: string; label: string }> = {
 ALTA: { bg: 'rgba(248,113,113,0.18)', color: '#F87171', label: 'Gravedad alta — requiere acción urgente' },
 MEDIA: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429', label: 'Gravedad media — atiende pronto' },
 BAJA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399', label: 'Gravedad baja — puedes planificarlo' },
};

export default function AnalisisIAPage() {
 const [situation, setSituation] = useState('');
 const [legalArea, setLegalArea] = useState('');
 const [loading, setLoading] = useState(false);
 const [result, setResult] = useState<any>(null);
 const [error, setError] = useState('');

 const analyze = async () => {
 if (situation.trim().length < 20) {
 setError('Describe tu situación con al menos 20 caracteres para un mejor análisis.');
 return;
 }
 setError('');
 setLoading(true);
 setResult(null);
 try {
 const data = await apiFetch('/ai/analyze', {
 method: 'POST',
 body: JSON.stringify({ situation, legalArea: legalArea || undefined }),
 });
 setResult(data.analysis);
 } catch (e: any) {
 setError(e.message || 'Error al conectar con la IA. Verifica que la API key esté configurada.');
 }
 setLoading(false);
 };

 const gravedad = result ? GRAVEDAD_COLOR[result.gravedad] : null;

 return (
 <div style={{ maxWidth: '760px', margin: '0 auto' }}>
 <Link href="/dashboard/metricas" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.25rem' }}>
 ← Volver
 </Link>

 {/* Header */}
 <div style={{ background: 'linear-gradient(135deg,#0C2340 0%,#1B4D8F 100%)', borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.5rem', color: '#fff' }}>
 <div style={{ marginBottom: '0.75rem', opacity: 0.85 }}>
 <CpuIcon size={36} stroke="#F0B429" />
 </div>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
 Análisis preliminar con IA
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', margin: 0 }}>
 Describe tu situación legal y la IA te dará una orientación inicial — qué derechos están en juego, posibles estrategias y próximos pasos recomendados.
 </p>
 </div>

 {/* Formulario */}
 {!result && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', marginBottom: '1rem' }}>
 <div style={{ marginBottom: '1.25rem' }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
 Área jurídica (opcional)
 </label>
 <select value={legalArea} onChange={e => setLegalArea(e.target.value)} style={{
 width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.6rem',
 border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.88rem', color: '#F1F5F9',
 outline: 'none', background: 'rgba(255,255,255,0.06)', boxSizing: 'border-box',
 }}>
 <option value="">Detectar automáticamente</option>
 {AREAS.filter(Boolean).map(a => <option key={a} value={a}>{AREA_LABEL[a]}</option>)}
 </select>
 </div>

 <div style={{ marginBottom: '1.25rem' }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
 Describe tu situación *
 </label>
 <textarea
 rows={7}
 placeholder="Explica tu situación con el mayor detalle posible. Por ejemplo: qué ocurrió, cuándo, quiénes están involucrados, qué documentos tienes, qué quieres lograr..."
 value={situation}
 onChange={e => setSituation(e.target.value)}
 maxLength={3000}
 style={{
 width: '100%', padding: '0.75rem', borderRadius: '0.6rem',
 border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.88rem', resize: 'vertical',
 fontFamily: 'inherit', color: '#F1F5F9', outline: 'none', boxSizing: 'border-box',
 lineHeight: 1.6, background: 'rgba(255,255,255,0.06)',
 }}
 />
 <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginTop: '0.25rem' }}>
 {situation.length}/3000
 </div>
 </div>

 {error && (
 <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.6rem', color: '#F87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
 {error}
 </div>
 )}

 <button onClick={analyze} disabled={loading} style={{
 width: '100%', padding: '0.85rem', borderRadius: '0.6rem', border: 'none',
 background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#0C2340,#1B4D8F)',
 color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
 }}>
 {loading ? (
 <>
 <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
 Analizando tu situación...
 </>
 ) : <><CpuIcon size={16} /> Analizar con IA</>}
 </button>

 <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '0.75rem', marginBottom: 0 }}>
 Este análisis es orientativo. No reemplaza la consulta con un abogado profesional.
 </p>
 </div>
 )}

 {/* Resultado */}
 {result && (
 <div>
 {/* Resumen + gravedad */}
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', marginBottom: '1rem' }}>
 <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
 <div>
 <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Área detectada</div>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '1rem' }}>{AREA_LABEL[result.areaLegal] || result.areaLegal}</div>
 </div>
 {gravedad && (
 <span style={{ padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, background: gravedad.bg, color: gravedad.color }}>
 {gravedad.label}
 </span>
 )}
 </div>
 <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{result.resumen}</p>
 </div>

 {/* Derechos */}
 {result.derechosAfectados?.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <ShieldIcon size={15} stroke="#F0B429" /> Derechos involucrados
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
 {result.derechosAfectados.map((d: string, i: number) => (
 <span key={i} style={{ padding: '0.3rem 0.75rem', background: 'rgba(59,130,246,0.15)', color: '#93C5FD', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>{d}</span>
 ))}
 </div>
 </div>
 )}

 {/* Estrategias */}
 {result.estrategias?.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <CheckIcon size={15} stroke="#34D399" /> Posibles estrategias legales
 </div>
 <div style={{ display: 'grid', gap: '0.5rem' }}>
 {result.estrategias.map((s: string, i: number) => (
 <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
 <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0C2340', color: '#F0B429', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>{i + 1}</span>
 <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{s}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Próximos pasos */}
 {result.proximosPasos?.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.88rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <ArrowRightIcon size={15} stroke="#60A5FA" /> Próximos pasos recomendados
 </div>
 <div style={{ display: 'grid', gap: '0.5rem' }}>
 {result.proximosPasos.map((p: string, i: number) => (
 <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
 <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(96,165,250,0.2)', color: '#60A5FA', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
 <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{p}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Advertencia */}
 {result.advertencia && (
 <div style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.75rem', borderLeft: '4px solid #F59E0B', marginBottom: '1.25rem' }}>
 <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FBBF24', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
 <AlertIcon size={13} stroke="#FBBF24" /> Aviso importante
 </div>
 <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{result.advertencia}</p>
 </div>
 )}

 {/* CTAs */}
 <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
 <button onClick={() => setResult(null)} style={{
 padding: '0.65rem 1.5rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.12)',
 background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
 display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
 }}>
 <RefreshIcon size={14} /> Nuevo análisis
 </button>
 <Link href="/abogados" style={{ textDecoration: 'none' }}>
 <button style={{
 padding: '0.65rem 1.5rem', borderRadius: '0.6rem', border: 'none',
 background: 'linear-gradient(135deg,#0C2340,#1B4D8F)', color: '#fff',
 fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
 }}>
 Consultar con un abogado
 </button>
 </Link>
 <Link href="/dashboard/mis-casos/nuevo" style={{ textDecoration: 'none' }}>
 <button style={{
 padding: '0.65rem 1.5rem', borderRadius: '0.6rem', border: 'none',
 background: '#F0B429', color: '#F1F5F9', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
 display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
 }}>
 <FolderIcon size={14} stroke="#0C2340" /> Abrir expediente
 </button>
 </Link>
 </div>
 </div>
 )}

 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 </div>
 );
}
