'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const AREAS = ['GENERAL', 'PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO'];
const AREA_COLOR: Record<string, { bg: string; color: string }> = {
 GENERAL: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
 PENAL: { bg: 'rgba(248,113,113,0.18)', color: '#F87171' },
 CIVIL: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 LOPNA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
 CORPORATIVO: { bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
};

export default function BlogAbogadoPage() {
 const [posts, setPosts] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [form, setForm] = useState({ title: '', content: '', excerpt: '', legalArea: 'GENERAL', imageUrl: '', published: false });

 const load = () => apiFetch('/blog/my/posts').then(d => setPosts(d.posts || [])).catch(() => {}).finally(() => setLoading(false));
 useEffect(() => { load(); }, []);

 const resetForm = () => { setForm({ title: '', content: '', excerpt: '', legalArea: 'GENERAL', imageUrl: '', published: false }); setEditId(null); };

 const handleSubmit = async (e: React.SyntheticEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 if (editId) await apiFetch(`/blog/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
 else await apiFetch('/blog', { method: 'POST', body: JSON.stringify(form) });
 setShowForm(false); resetForm(); load();
 } catch (e: any) { alert(e.message); }
 finally { setSaving(false); }
 };

 const handleEdit = (p: any) => {
 setForm({ title: p.title, content: p.content, excerpt: p.excerpt || '', legalArea: p.legalArea, imageUrl: p.imageUrl || '', published: p.published });
 setEditId(p.id); setShowForm(true);
 };

 const togglePublish = async (p: any) => {
 await apiFetch(`/blog/${p.id}`, { method: 'PUT', body: JSON.stringify({ published: !p.published }) });
 load();
 };

 const handleDelete = async (id: string) => {
 if (!confirm('¿Eliminar este artículo?')) return;
 await apiFetch(`/blog/${id}`, { method: 'DELETE' });
 load();
 };

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>Mis Artículos</h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{posts.length} artículo{posts.length !== 1 ? 's' : ''}</p>
 </div>
 <button onClick={() => { setShowForm(!showForm); resetForm(); }} className="btn btn-primary">
 {showForm ? 'Cancelar' : '+ Nuevo artículo'}
 </button>
 </div>

 {showForm && (
 <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
 <h3 style={{ margin: '0 0 1.25rem', color: '#F1F5F9', fontSize: '1rem' }}>{editId ? 'Editar artículo' : 'Nuevo artículo'}</h3>
 <form onSubmit={handleSubmit}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Título *</label>
 <input className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título del artículo..." />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Área jurídica</label>
 <select className="form-input" value={form.legalArea} onChange={e => setForm(f => ({ ...f, legalArea: e.target.value }))}>
 {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
 </select>
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">URL de imagen (opcional)</label>
 <input className="form-input" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
 </div>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Resumen (opcional)</label>
 <input className="form-input" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Breve descripción del artículo..." />
 </div>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Contenido *</label>
 <textarea className="form-input" required rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Escribí el contenido del artículo..." style={{ resize: 'vertical' }} />
 </div>
 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>
 <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
 Publicar inmediatamente
 </label>
 </div>
 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear artículo'}</button>
 </form>
 </div>
 )}

 {posts.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
 <h3 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>Aún no publicaste artículos</h3>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>Compartí tu conocimiento legal con tus clientes.</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gap: '1rem' }}>
 {posts.map(p => {
 const ac = AREA_COLOR[p.legalArea] || AREA_COLOR.GENERAL;
 return (
 <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.95rem' }}>{p.title}</span>
 <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600, background: ac.bg, color: ac.color }}>{p.legalArea}</span>
 <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600, background: p.published ? 'rgba(52,211,153,0.18)' : 'rgba(240,180,41,0.18)', color: p.published ? '#34D399' : '#F0B429' }}>
 {p.published ? '✓ Publicado' : 'Borrador'}
 </span>
 </div>
 {p.excerpt && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', margin: 0, lineHeight: 1.5 }}>{p.excerpt}</p>}
 <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
 {p.publishedAt ? `Publicado el ${new Date(p.publishedAt).toLocaleDateString('es-VE')}` : `Creado el ${new Date(p.createdAt).toLocaleDateString('es-VE')}`}
 </div>
 </div>
 <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
 <button onClick={() => togglePublish(p)} className="btn btn-secondary btn-sm">
 {p.published ? 'Despublicar' : 'Publicar'}
 </button>
 <button onClick={() => handleEdit(p)} className="btn btn-secondary btn-sm">Editar</button>
 <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm">Eliminar</button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
