'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ClockIcon, RefreshIcon, CalendarIcon, InboxIcon } from '@/components/Icons';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

interface Slot {
 id: string;
 dayOfWeek: number | null;
 specificDate: string | null;
 startTime: string;
 endTime: string;
 isRecurring: boolean;
}

function timeRange(start: string, end: string) {
 return `${start} – ${end}`;
}

export default function DisponibilidadPage() {
 const [slots, setSlots] = useState<Slot[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [tab, setTab] = useState<'recurrente' | 'puntual'>('recurrente');
 const [form, setForm] = useState({
 dayOfWeek: 1,
 specificDate: '',
 startTime: '09:00',
 endTime: '10:00',
 });
 const [error, setError] = useState('');

 const load = async () => {
 try {
 const data = await apiFetch('/availability');
 setSlots(data.slots || []);
 } catch { }
 setLoading(false);
 };

 useEffect(() => { load(); }, []);

 const addSlot = async () => {
 setError('');
 if (form.startTime >= form.endTime) {
 setError('La hora de inicio debe ser menor a la hora de fin');
 return;
 }
 setSaving(true);
 try {
 await apiFetch('/availability', {
 method: 'POST',
 body: JSON.stringify({
 isRecurring: tab === 'recurrente',
 dayOfWeek: tab === 'recurrente' ? form.dayOfWeek : undefined,
 specificDate: tab === 'puntual' ? form.specificDate : undefined,
 startTime: form.startTime,
 endTime: form.endTime,
 }),
 });
 await load();
 } catch (e: any) { setError(e.message); }
 setSaving(false);
 };

 const removeSlot = async (id: string) => {
 try {
 await apiFetch(`/availability/${id}`, { method: 'DELETE' });
 setSlots(s => s.filter(x => x.id !== id));
 } catch (e: any) { alert(e.message); }
 };

 // Agrupar slots recurrentes por día
 const recurringByDay: Record<number, Slot[]> = {};
 const specificSlots: Slot[] = [];
 slots.forEach(s => {
 if (s.isRecurring && s.dayOfWeek !== null) {
 if (!recurringByDay[s.dayOfWeek]) recurringByDay[s.dayOfWeek] = [];
 recurringByDay[s.dayOfWeek].push(s);
 } else {
 specificSlots.push(s);
 }
 });

 const inputStyle: React.CSSProperties = {
 padding: '0.55rem 0.75rem', borderRadius: '0.55rem', border: '1px solid rgba(255,255,255,0.08)',
 fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', outline: 'none', background: 'rgba(255,255,255,0.04)', width: '100%', boxSizing: 'border-box',
 };

 return (
 <div style={{ maxWidth: '820px', margin: '0 auto' }}>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
 Mi disponibilidad
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: '2rem' }}>
 Define los horarios en que los clientes pueden agendar una consulta contigo.
 </p>

 {/* ── FORMULARIO ─────────────────────────────────────── */}
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '2rem' }}>
 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
 <ClockIcon size={16} stroke="#F0B429" />
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.95rem' }}>Agregar horario disponible</span>
 </div>
 <div style={{ padding: '1.25rem 1.5rem' }}>
 {/* Tabs */}
 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
 {(['recurrente', 'puntual'] as const).map(t => (
 <button key={t} onClick={() => setTab(t)} style={{
 padding: '0.4rem 1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
 fontSize: '0.82rem', fontWeight: 600,
 background: tab === t ? 'rgba(240,180,41,0.15)' : 'rgba(255,255,255,0.06)',
 color: tab === t ? '#F0B429' : 'rgba(255,255,255,0.5)',
 }}>
 {t === 'recurrente' ? 'Semanal' : 'Fecha específica'}
 </button>
 ))}
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: tab === 'recurrente' ? '1.5fr 1fr 1fr auto' : '1.5fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
 {/* Día o fecha */}
 {tab === 'recurrente' ? (
 <div>
 <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Día</label>
 <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))} style={inputStyle}>
 {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
 </select>
 </div>
 ) : (
 <div>
 <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Fecha</label>
 <input type="date" value={form.specificDate} onChange={e => setForm(f => ({ ...f, specificDate: e.target.value }))} style={inputStyle} />
 </div>
 )}

 {/* Hora inicio */}
 <div>
 <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Desde</label>
 <select value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputStyle}>
 {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
 </select>
 </div>

 {/* Hora fin */}
 <div>
 <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Hasta</label>
 <select value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inputStyle}>
 {HOURS.filter(h => h > form.startTime).map(h => <option key={h} value={h}>{h}</option>)}
 </select>
 </div>

 <button onClick={addSlot} disabled={saving || (tab === 'puntual' && !form.specificDate)} style={{
 padding: '0.55rem 1.25rem', borderRadius: '0.55rem', border: 'none', cursor: 'pointer',
 background: 'linear-gradient(135deg,#0C2340,#1B4D8F)', color: '#fff',
 fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap',
 opacity: saving || (tab === 'puntual' && !form.specificDate) ? 0.6 : 1,
 }}>
 {saving ? '...' : 'Agregar'}
 </button>
 </div>

 {error && <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: '#FEE2E2', borderRadius: '0.5rem', color: '#F87171', fontSize: '0.82rem' }}>{error}</div>}
 </div>
 </div>

 {/* ── SLOTS ACTUALES ─────────────────────────────────── */}
 {loading ? (
 <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Cargando horarios...</div>
 ) : slots.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'rgba(255,255,255,0.35)' }}>
 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', opacity: 0.4 }}>
 <InboxIcon size={32} />
 </div>
 <p style={{ margin: 0 }}>Aún no tienes horarios definidos.<br />Agrega tu primer bloque disponible.</p>
 </div>
 ) : (
 <>
 {/* Recurrentes por día */}
 {Object.keys(recurringByDay).length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '1rem' }}>
 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <RefreshIcon size={14} stroke="#F0B429" />
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.92rem' }}>Horarios semanales</span>
 </div>
 <div style={{ padding: '0.75rem 1.5rem' }}>
 {/* Grilla visual de semana */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
 {[1,2,3,4,5,6,0].map(dow => (
 <div key={dow} style={{ textAlign: 'center' }}>
 <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
 {DAYS[dow].slice(0, 3)}
 </div>
 <div style={{
 minHeight: '60px', borderRadius: '0.5rem', padding: '0.3rem',
 background: recurringByDay[dow]?.length ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
 border: `1px solid ${recurringByDay[dow]?.length ? '#BFDBFE' : 'rgba(255,255,255,0.06)'}`,
 }}>
 {(recurringByDay[dow] || []).map(s => (
 <div key={s.id} style={{ fontSize: '0.58rem', color: '#60A5FA', fontWeight: 600, lineHeight: 1.4 }}>
 {s.startTime}–{s.endTime}
 </div>
 ))}
 {!recurringByDay[dow]?.length && (
 <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', paddingTop: '0.5rem' }}>—</div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Lista detallada */}
 <div style={{ display: 'grid', gap: '0.4rem' }}>
 {[1,2,3,4,5,6,0].flatMap(dow => (recurringByDay[dow] || []).map(s => (
 <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60A5FA', minWidth: '70px' }}>{DAYS[s.dayOfWeek!]}</span>
 <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>{timeRange(s.startTime, s.endTime)}</span>
 </div>
 <button onClick={() => removeSlot(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '1rem', padding: '0 0.25rem' }}>×</button>
 </div>
 )))}
 </div>
 </div>
 </div>
 )}

 {/* Puntuales */}
 {specificSlots.length > 0 && (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <CalendarIcon size={14} stroke="#F0B429" />
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.92rem' }}>Fechas específicas</span>
 </div>
 <div style={{ padding: '0.75rem 1.5rem', display: 'grid', gap: '0.4rem' }}>
 {specificSlots.sort((a, b) => new Date(a.specificDate!).getTime() - new Date(b.specificDate!).getTime()).map(s => (
 <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C084FC', minWidth: '90px' }}>
 {new Date(s.specificDate!).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
 </span>
 <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>{timeRange(s.startTime, s.endTime)}</span>
 </div>
 <button onClick={() => removeSlot(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '1rem', padding: '0 0.25rem' }}>×</button>
 </div>
 ))}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}
