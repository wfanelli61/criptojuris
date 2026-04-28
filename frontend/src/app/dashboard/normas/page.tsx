'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const TIPOS = ['', 'LEY', 'JURISPRUDENCIA', 'SENTENCIA'];
const AREAS = ['', 'PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO', 'GENERAL'];

const TIPO_COLOR: Record<string, { bg: string; color: string }> = {
 LEY: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 JURISPRUDENCIA:{ bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
 SENTENCIA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
};
const AREA_COLOR: Record<string, { bg: string; color: string }> = {
 PENAL: { bg: 'rgba(248,113,113,0.18)', color: '#F87171' },
 CIVIL: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 LOPNA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
 CORPORATIVO: { bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
 GENERAL: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
};

export default function NormasPage() {
 const [norms, setNorms] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filterTipo, setFilterTipo] = useState('');
 const [filterArea, setFilterArea] = useState('');
 const [selected, setSelected] = useState<any>(null);
 const [cases, setCases] = useState<any[]>([]);
 const [linking, setLinking] = useState(false);
 const [linkCaseId, setLinkCaseId] = useState('');
 const [linkMsg, setLinkMsg] = useState('');

 useEffect(() => {
 apiFetch('/legal-norms?limit=200')
 .then(d => setNorms(d.norms || []))
 .catch(() => {})
 .finally(() => setLoading(false));
 apiFetch('/cases?limit=100')
 .then(d => setCases(d.cases || []))
 .catch(() => {});
 }, []);

 const filtered = norms.filter(n => {
 const matchTipo = !filterTipo || n.type === filterTipo;
 const matchArea = !filterArea || n.legalArea === filterArea;
 const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()) || n.source?.toLowerCase().includes(search.toLowerCase());
 return matchTipo && matchArea && matchSearch;
 });

 const handleLink = async () => {
 if (!linkCaseId || !selected) return;
 setLinking(true);
 setLinkMsg('');
 try {
 await apiFetch(`/cases/${linkCaseId}/norms/${selected.id}`, { method: 'POST' });
 setLinkMsg('✓ Norma vinculada al expediente');
 } catch (e: any) {
 setLinkMsg(e.message || 'Error al vincular');
 } finally {
 setLinking(false);
 }
 };

 return (
 <div>
 <div style={{ marginBottom: '1.5rem' }}>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>
 Normas Jurídicas
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
 Consultá leyes, jurisprudencia y sentencias. Vinculalas a tus expedientes.
 </p>
 </div>

 {/* Filtros */}
 <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
 <input
 className="form-input"
 placeholder="Buscar por título, contenido o fuente..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 style={{ maxWidth: '320px', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
 />
 <select className="form-input" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
 style={{ maxWidth: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
 <option value="">Todos los tipos</option>
 {TIPOS.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 <select className="form-input" value={filterArea} onChange={e => setFilterArea(e.target.value)}
 style={{ maxWidth: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
 <option value="">Todas las áreas</option>
 {AREAS.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
 </select>
 <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
 {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
 </span>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>

 {/* Lista */}
 <div>
 {loading ? (
 <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
 ) : filtered.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
 <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📚</div>
 <p>No se encontraron normas con esos criterios.</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {filtered.map(n => {
 const tc = TIPO_COLOR[n.type] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 const ac = AREA_COLOR[n.legalArea] || AREA_COLOR.GENERAL;
 const isSelected = selected?.id === n.id;
 return (
 <div
 key={n.id}
 onClick={() => setSelected(isSelected ? null : n)}
 style={{
 background: isSelected ? 'rgba(240,180,41,0.08)' : 'rgba(255,255,255,0.04)',
 border: `1px solid ${isSelected ? 'rgba(240,180,41,0.4)' : 'rgba(255,255,255,0.08)'}`,
 borderRadius: '0.875rem',
 padding: '1.1rem 1.25rem',
 cursor: 'pointer',
 transition: 'all 0.15s',
 }}
 >
 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
 <span style={{ padding: '0.18rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: tc.bg, color: tc.color }}>{n.type}</span>
 <span style={{ padding: '0.18rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: ac.bg, color: ac.color }}>{n.legalArea}</span>
 {n.source && <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{n.source}</span>}
 </div>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.92rem', marginBottom: '0.35rem' }}>{n.title}</div>
 <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
 {n.content}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Panel detalle */}
 {selected && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', position: 'sticky', top: '1rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
 <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
 <span style={{ padding: '0.18rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: TIPO_COLOR[selected.type]?.bg, color: TIPO_COLOR[selected.type]?.color }}>{selected.type}</span>
 <span style={{ padding: '0.18rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: AREA_COLOR[selected.legalArea]?.bg || 'rgba(255,255,255,0.08)', color: AREA_COLOR[selected.legalArea]?.color || 'rgba(255,255,255,0.55)' }}>{selected.legalArea}</span>
 </div>
 <button onClick={() => { setSelected(null); setLinkMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
 </div>

 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.5rem', lineHeight: 1.4 }}>{selected.title}</h3>
 {selected.source && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>Fuente: {selected.source}</p>}
 {selected.publishedAt && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>Publicado: {new Date(selected.publishedAt).toLocaleDateString('es-VE')}</p>}

 <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
 <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto' }}>{selected.content}</p>
 </div>

 {/* Vincular a caso */}
 <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
 <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.5rem' }}>Vincular a un expediente</p>
 <select
 className="form-input"
 value={linkCaseId}
 onChange={e => { setLinkCaseId(e.target.value); setLinkMsg(''); }}
 style={{ width: '100%', padding: '0.45rem 0.7rem', fontSize: '0.82rem', marginBottom: '0.5rem' }}
 >
 <option value="">Seleccioná un expediente...</option>
 {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
 </select>
 <button
 onClick={handleLink}
 disabled={!linkCaseId || linking}
 className="btn btn-primary"
 style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem' }}
 >
 {linking ? 'Vinculando...' : 'Vincular norma'}
 </button>
 {linkMsg && (
 <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: linkMsg.startsWith('✓') ? '#34D399' : '#F87171', textAlign: 'center' }}>{linkMsg}</p>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
