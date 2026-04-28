'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const INTERVALS = ['MENSUAL', 'ANUAL'];

const DEFAULT_FEATURES = ['Soporte prioritario', 'Acceso al blog', 'Chat con clientes', 'Gestión de expedientes'];

export default function AdminPlanesPage() {
 const [plans, setPlans] = useState<any[]>([]);
 const [subs, setSubs] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [featureInput, setFeatureInput] = useState('');
 const [form, setForm] = useState({
 name: '', description: '', price: '', currency: 'USD',
 interval: 'MENSUAL', maxCases: '10', maxClients: '30', features: [] as string[],
 });

 const load = async () => {
 const [pd, sd] = await Promise.all([
 apiFetch('/plans/all').catch(() => ({ plans: [] })),
 apiFetch('/plans/subscriptions').catch(() => ({ subscriptions: [] })),
 ]);
 setPlans(pd.plans || []);
 setSubs(sd.subscriptions || []);
 setLoading(false);
 };
 useEffect(() => { load(); }, []);

 const resetForm = () => {
 setForm({ name: '', description: '', price: '', currency: 'USD', interval: 'MENSUAL', maxCases: '10', maxClients: '30', features: [] });
 setEditId(null); setFeatureInput('');
 };

 const handleEdit = (p: any) => {
 setForm({
 name: p.name, description: p.description || '', price: String(p.price),
 currency: p.currency, interval: p.interval,
 maxCases: String(p.maxCases), maxClients: String(p.maxClients),
 features: JSON.parse(p.features || '[]'),
 });
 setEditId(p.id); setShowForm(true);
 };

 const handleSubmit = async (e: React.SyntheticEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 const body = { ...form, price: Number(form.price), maxCases: Number(form.maxCases), maxClients: Number(form.maxClients) };
 if (editId) await apiFetch(`/plans/${editId}`, { method: 'PUT', body: JSON.stringify(body) });
 else await apiFetch('/plans', { method: 'POST', body: JSON.stringify(body) });
 setShowForm(false); resetForm(); load();
 } catch (e: any) { alert(e.message); }
 finally { setSaving(false); }
 };

 const handleDeactivate = async (id: string) => {
 if (!confirm('¿Desactivar este plan?')) return;
 await apiFetch(`/plans/${id}`, { method: 'DELETE' });
 load();
 };

 const addFeature = () => {
 const f = featureInput.trim();
 if (f && !form.features.includes(f)) {
 setForm(prev => ({ ...prev, features: [...prev.features, f] }));
 }
 setFeatureInput('');
 };

 const removeFeature = (f: string) => setForm(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }));

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>Planes de Suscripción</h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{plans.length} plan{plans.length !== 1 ? 'es' : ''} · {subs.filter(s => s.status === 'ACTIVA').length} suscripciones activas</p>
 </div>
 <button onClick={() => { setShowForm(!showForm); resetForm(); }} className="btn btn-primary">
 {showForm ? 'Cancelar' : '+ Nuevo plan'}
 </button>
 </div>

 {/* Formulario */}
 {showForm && (
 <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
 <h3 style={{ margin: '0 0 1.25rem', color: '#F1F5F9', fontSize: '1rem' }}>{editId ? 'Editar plan' : 'Nuevo plan'}</h3>
 <form onSubmit={handleSubmit}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Nombre del plan *</label>
 <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Plan Profesional" />
 </div>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Descripción</label>
 <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descripción del plan..." />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Precio *</label>
 <input className="form-input" type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Moneda</label>
 <select className="form-input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
 {['USD', 'VES', 'EUR'].map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Facturación</label>
 <select className="form-input" value={form.interval} onChange={e => setForm(f => ({ ...f, interval: e.target.value }))}>
 {INTERVALS.map(i => <option key={i} value={i}>{i}</option>)}
 </select>
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Máx. casos activos</label>
 <input className="form-input" type="number" min="1" value={form.maxCases} onChange={e => setForm(f => ({ ...f, maxCases: e.target.value }))} />
 </div>
 <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
 <label className="form-label">Características incluidas</label>
 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
 <input className="form-input" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
 placeholder="Ej: Soporte 24/7..." style={{ flex: 1 }} />
 <button type="button" onClick={addFeature} className="btn btn-secondary btn-sm">Agregar</button>
 </div>
 <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
 {DEFAULT_FEATURES.filter(f => !form.features.includes(f)).map(f => (
 <button key={f} type="button" onClick={() => setForm(p => ({ ...p, features: [...p.features, f] }))}
 style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', borderRadius: '9999px', border: '1px dashed #D1D5DB', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.45)' }}>
 + {f}
 </button>
 ))}
 </div>
 {form.features.length > 0 && (
 <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
 {form.features.map(f => (
 <span key={f} style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', borderRadius: '9999px', background: 'rgba(52,211,153,0.18)', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
 ✓ {f}
 <button type="button" onClick={() => removeFeature(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34D399', fontSize: '0.8rem', padding: 0, lineHeight: 1 }}>✕</button>
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear plan'}</button>
 </form>
 </div>
 )}

 {/* Grid de planes */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
 {plans.map(p => {
 const features: string[] = JSON.parse(p.features || '[]');
 const subCount = subs.filter(s => s.planId === p.id && s.status === 'ACTIVA').length;
 return (
 <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: `1px solid ${p.active ? 'rgba(255,255,255,0.08)' : 'rgba(248,113,113,0.3)'}`, padding: '1.5rem', position: 'relative', opacity: p.active ? 1 : 0.6 }}>
 {!p.active && <span style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.65rem', background: 'rgba(248,113,113,0.18)', color: '#F87171', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>INACTIVO</span>}
 <div style={{ marginBottom: '0.75rem' }}>
 <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 0.2rem' }}>{p.name}</h3>
 {p.description && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{p.description}</p>}
 </div>
 <div style={{ marginBottom: '1rem' }}>
 <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F1F5F9' }}>{p.currency} {Number(p.price).toFixed(2)}</span>
 <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>/{p.interval.toLowerCase()}</span>
 </div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem' }}>
 Máx. {p.maxCases} casos · {p.maxClients} clientes
 </div>
 {features.length > 0 && (
 <ul style={{ margin: '0 0 1rem', padding: 0, listStyle: 'none' }}>
 {features.map(f => (
 <li key={f} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
 <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {f}
 </li>
 ))}
 </ul>
 )}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
 <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{subCount} suscripción{subCount !== 1 ? 'es' : ''} activa{subCount !== 1 ? 's' : ''}</span>
 <div style={{ display: 'flex', gap: '0.4rem' }}>
 <button onClick={() => handleEdit(p)} className="btn btn-secondary btn-sm">Editar</button>
 {p.active && <button onClick={() => handleDeactivate(p.id)} className="btn btn-danger btn-sm">Desactivar</button>}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Tabla de suscripciones */}
 <div style={{ marginBottom: '1rem' }}>
 <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 1rem' }}>Suscripciones</h2>
 </div>
 <div className="table-container">
 <table className="table">
 <thead><tr><th>Abogado</th><th>Plan</th><th>Estado</th><th>Inicio</th><th>Vencimiento</th><th>Acciones</th></tr></thead>
 <tbody>
 {subs.length === 0 ? (
 <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>No hay suscripciones registradas</td></tr>
 ) : subs.map(s => {
 const stColor: Record<string, { bg: string; color: string }> = {
 ACTIVA: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
 CANCELADA: { bg: 'rgba(248,113,113,0.18)', color: '#F87171' },
 VENCIDA: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
 PENDIENTE: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429' },
 };
 const sc = stColor[s.status] || stColor.PENDIENTE;
 return (
 <tr key={s.id}>
 <td>
 <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F1F5F9' }}>{s.user?.name}</div>
 <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>{s.user?.email}</div>
 </td>
 <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{s.plan?.name}</td>
 <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{s.status}</span></td>
 <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{new Date(s.startDate).toLocaleDateString('es-VE')}</td>
 <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{s.endDate ? new Date(s.endDate).toLocaleDateString('es-VE') : '—'}</td>
 <td>
 <select className="form-input" defaultValue={s.status}
 onChange={async e => {
 await apiFetch(`/plans/subscriptions/${s.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) });
 load();
 }}
 style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}>
 {['ACTIVA', 'CANCELADA', 'VENCIDA', 'PENDIENTE'].map(st => <option key={st} value={st}>{st}</option>)}
 </select>
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
