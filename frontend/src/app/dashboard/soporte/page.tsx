'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { HeadphonesIcon, InboxIcon, PlusIcon } from '@/components/Icons';

const STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
 ABIERTO: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429', label: 'Abierto' },
 EN_PROCESO: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC', label: 'En proceso' },
 CERRADO: { bg: 'rgba(52,211,153,0.18)', color: '#34D399', label: 'Cerrado' },
};

export default function SoportePage() {
 const { user } = useAuth();
 const [tickets, setTickets] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [form, setForm] = useState({ subject: '', message: '' });
 const [showForm, setShowForm] = useState(false);
 const [saving, setSaving] = useState(false);
 const [selected, setSelected] = useState<any>(null);
 const [response, setResponse] = useState('');
 const [responding, setResponding] = useState(false);

 const load = () => apiFetch('/support').then(d => setTickets(d.tickets)).catch(() => {}).finally(() => setLoading(false));
 useEffect(() => { load(); }, []);

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 await apiFetch('/support', { method: 'POST', body: JSON.stringify(form) });
 setForm({ subject: '', message: '' });
 setShowForm(false);
 load();
 } catch (e: any) { alert(e.message); }
 finally { setSaving(false); }
 };

 const handleRespond = async (id: string) => {
 if (!response.trim()) return;
 setResponding(true);
 try {
 await apiFetch(`/support/${id}/respond`, { method: 'PATCH', body: JSON.stringify({ response, status: 'CERRADO' }) });
 setSelected(null); setResponse('');
 load();
 } catch (e: any) { alert(e.message); }
 finally { setResponding(false); }
 };

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div style={{ maxWidth: '720px', margin: '0 auto' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
 <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429' }}>
 <HeadphonesIcon size={20} />
 </div>
 <div>
 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Ayuda</p>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Soporte</h1>
 </div>
 </div>
 {user?.role !== 'ADMIN' && (
 <button onClick={() => setShowForm(!showForm)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#F0B429', color: '#F1F5F9', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
 <PlusIcon size={15} stroke="#0C2340" /> Nuevo ticket
 </button>
 )}
 </div>

 {showForm && (
 <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
 <h3 style={{ margin: '0 0 1rem', color: '#F1F5F9', fontSize: '1rem' }}>Nuevo ticket de soporte</h3>
 <form onSubmit={handleCreate}>
 <div className="form-group">
 <label className="form-label">Asunto *</label>
 <input className="form-input" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Describí brevemente el problema..." />
 </div>
 <div className="form-group">
 <label className="form-label">Mensaje *</label>
 <textarea className="form-input" required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Contanos en detalle qué necesitás..." style={{ resize: 'vertical' }} />
 </div>
 <div style={{ display: 'flex', gap: '0.75rem' }}>
 <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enviando...' : 'Enviar ticket'}</button>
 </div>
 </form>
 </div>
 )}

 {tickets.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
 <div style={{ color: 'rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
 <InboxIcon size={40} />
 </div>
 <p style={{ color: 'rgba(255,255,255,0.35)' }}>No hay tickets de soporte aún.</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {tickets.map(t => {
 const st = STATUS_COLOR[t.status] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', label: t.status };
 return (
 <div key={t.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
 <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.92rem' }}>{t.subject}</div>
 <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
 {user?.role === 'ADMIN' && `${t.user?.name} · `}
 {new Date(t.createdAt).toLocaleDateString('es-VE')}
 </div>
 </div>
 <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: st.bg, color: st.color }}>
 {st.label}
 </span>
 <button onClick={() => setSelected(selected?.id === t.id ? null : t)} className="btn btn-secondary btn-sm">
 {selected?.id === t.id ? 'Cerrar' : 'Ver'}
 </button>
 </div>
 {selected?.id === t.id && (
 <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
 <div style={{ marginBottom: '0.75rem' }}>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Mensaje</div>
 <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{t.message}</p>
 </div>
 {t.response && (
 <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '0.5rem' }}>
 <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, marginBottom: '0.25rem' }}>Respuesta del equipo</div>
 <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>{t.response}</p>
 </div>
 )}
 {user?.role === 'ADMIN' && !t.response && (
 <div>
 <textarea className="form-input" rows={3} placeholder="Escribí tu respuesta..." value={response} onChange={e => setResponse(e.target.value)} style={{ resize: 'vertical', marginBottom: '0.5rem' }} />
 <button onClick={() => handleRespond(t.id)} className="btn btn-primary btn-sm" disabled={responding}>
 {responding ? '...' : 'Responder y cerrar'}
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
