'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const TIPOS = ['LEY', 'JURISPRUDENCIA', 'SENTENCIA'];
const AREAS = ['PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO', 'GENERAL'];
const TIPO_COLOR: Record<string, { bg: string; color: string }> = {
 LEY: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 JURISPRUDENCIA: { bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
 SENTENCIA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
};

export default function AdminNormasPage() {
 const [norms, setNorms] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 const [search, setSearch] = useState('');
 const [filterTipo, setFilterTipo] = useState('');
 const [saving, setSaving] = useState(false);
 const [form, setForm] = useState({ title: '', content: '', type: 'LEY', legalArea: 'PENAL', source: '', publishedAt: '' });

 const load = () => apiFetch('/legal-norms?limit=100').then(d => setNorms(d.norms || [])).catch(() => {}).finally(() => setLoading(false));
 useEffect(() => { load(); }, []);

 const handleSubmit = async (e: React.SyntheticEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 if (editId) await apiFetch(`/legal-norms/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
 else await apiFetch('/legal-norms', { method: 'POST', body: JSON.stringify(form) });
 setShowForm(false); setEditId(null);
 setForm({ title: '', content: '', type: 'LEY', legalArea: 'PENAL', source: '', publishedAt: '' });
 load();
 } catch (e: any) { alert(e.message); }
 finally { setSaving(false); }
 };

 const handleEdit = (n: any) => {
 setForm({ title: n.title, content: n.content, type: n.type, legalArea: n.legalArea, source: n.source || '', publishedAt: n.publishedAt ? n.publishedAt.split('T')[0] : '' });
 setEditId(n.id); setShowForm(true);
 };

 const handleDelete = async (id: string) => {
 if (!confirm('¿Desactivar esta norma?')) return;
 await apiFetch(`/legal-norms/${id}`, { method: 'DELETE' });
 load();
 };

 const filtered = norms.filter(n =>
 (!filterTipo || n.type === filterTipo) &&
 (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.source?.toLowerCase().includes(search.toLowerCase()))
 );

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>Normas Jurídicas</h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{norms.length} normas registradas</p>
 </div>
 <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', content: '', type: 'LEY', legalArea: 'PENAL', source: '', publishedAt: '' }); }} className="btn btn-primary">
 {showForm ? 'Cancelar' : '+ Nueva norma'}
 </button>
 </div>

 {showForm && (
 <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
 <h3 style={{ margin: '0 0 1.25rem', color: '#F1F5F9', fontSize: '1rem' }}>{editId ? 'Editar norma' : 'Nueva norma jurídica'}</h3>
 <form onSubmit={handleSubmit}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Título *</label>
 <input className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Artículo 44 de la Constitución..." />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Tipo *</label>
 <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
 {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Área jurídica *</label>
 <select className="form-input" value={form.legalArea} onChange={e => setForm(f => ({ ...f, legalArea: e.target.value }))}>
 {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
 </select>
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Fuente</label>
 <input className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Gaceta Oficial N°..." />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Fecha de publicación</label>
 <input className="form-input" type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} />
 </div>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Contenido *</label>
 <textarea className="form-input" required rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Texto completo de la norma..." style={{ resize: 'vertical' }} />
 </div>
 </div>
 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear norma'}</button>
 </form>
 </div>
 )}

 {/* Filtros */}
 <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
 <input className="form-input" placeholder="Buscar norma..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '260px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} />
 <select className="form-input" value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ maxWidth: '180px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}>
 <option value="">Todos los tipos</option>
 {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>

 <div className="table-container">
 <table className="table">
 <thead><tr><th>Título</th><th>Tipo</th><th>Área</th><th>Fuente</th><th>Acciones</th></tr></thead>
 <tbody>
 {filtered.length === 0 ? (
 <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>No hay normas registradas</td></tr>
 ) : filtered.map(n => {
 const tc = TIPO_COLOR[n.type] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 return (
 <tr key={n.id}>
 <td style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.88rem', maxWidth: '280px' }}>{n.title}</td>
 <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: tc.bg, color: tc.color }}>{n.type}</span></td>
 <td style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>{n.legalArea}</td>
 <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{n.source || '—'}</td>
 <td>
 <div style={{ display: 'flex', gap: '0.4rem' }}>
 <button onClick={() => handleEdit(n)} className="btn btn-secondary btn-sm">Editar</button>
 <button onClick={() => handleDelete(n.id)} className="btn btn-danger btn-sm">Desactivar</button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
}
