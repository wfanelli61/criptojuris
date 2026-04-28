'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CreditCardIcon, InboxIcon, CheckIcon } from '@/components/Icons';

const INTERVAL_LABEL: Record<string, string> = { MENSUAL: 'mes', ANUAL: 'año' };

export default function SuscripcionPage() {
 const [plans, setPlans] = useState<any[]>([]);
 const [current, setCurrent] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [subscribing, setSubscribing] = useState('');

 const load = async () => {
 const [pd, sd] = await Promise.all([
 apiFetch('/plans').catch(() => ({ plans: [] })),
 apiFetch('/plans/subscriptions/me').catch(() => ({ subscription: null })),
 ]);
 setPlans(pd.plans || []);
 setCurrent(sd.subscription);
 setLoading(false);
 };
 useEffect(() => { load(); }, []);

 const handleSubscribe = async (planId: string) => {
 setSubscribing(planId);
 try {
 await apiFetch('/plans/subscribe', { method: 'POST', body: JSON.stringify({ planId }) });
 load();
 } catch (e: any) { alert(e.message); }
 finally { setSubscribing(''); }
 };

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
 <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429' }}>
 <CreditCardIcon size={20} />
 </div>
 <div>
 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Cuenta</p>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Mi Suscripción</h1>
 </div>
 </div>

 {/* Suscripción actual */}
 {current && (
 <div style={{ background: 'linear-gradient(135deg, #0C2340, #1B4D8F)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', color: '#fff' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Plan actual</div>
 <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{current.plan?.name}</div>
 <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.25rem' }}>
 {current.plan?.currency} {Number(current.plan?.price).toFixed(2)} / {INTERVAL_LABEL[current.plan?.interval] || current.plan?.interval}
 </div>
 </div>
 <div style={{ textAlign: 'right' }}>
 <span style={{
 padding: '0.3rem 0.9rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
 background: current.status === 'ACTIVA' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
 color: current.status === 'ACTIVA' ? '#6EE7B7' : '#FCA5A5',
 border: `1px solid ${current.status === 'ACTIVA' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
 }}>{current.status}</span>
 {current.endDate && (
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem' }}>
 Vence: {new Date(current.endDate).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
 </div>
 )}
 </div>
 </div>
 {(() => {
 const features: string[] = JSON.parse(current.plan?.features || '[]');
 return features.length > 0 ? (
 <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
 {features.map(f => (
 <span key={f} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
 ✓ {f}
 </span>
 ))}
 </div>
 ) : null;
 })()}
 </div>
 )}

 {/* Planes disponibles */}
 {plans.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
 <div style={{ color: 'rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
 <InboxIcon size={40} />
 </div>
 <p style={{ color: 'rgba(255,255,255,0.35)' }}>No hay planes disponibles aún. El administrador los configurará pronto.</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
 {plans.map(p => {
 const features: string[] = JSON.parse(p.features || '[]');
 const isCurrent = current?.planId === p.id && current?.status === 'ACTIVA';
 return (
 <div key={p.id} style={{
 background: 'rgba(255,255,255,0.04)',
 border: `2px solid ${isCurrent ? '#1B4D8F' : 'rgba(255,255,255,0.08)'}`,
 borderRadius: '1.25rem',
 padding: '1.75rem',
 position: 'relative',
 transition: 'box-shadow 0.2s',
 }}>
 {isCurrent && (
 <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#0C2340', color: '#F0B429', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.8rem', borderRadius: '0 0 8px 8px', letterSpacing: '0.06em' }}>
 PLAN ACTUAL
 </div>
 )}

 <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 0.4rem' }}>{p.name}</h3>
 {p.description && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1rem', lineHeight: 1.5 }}>{p.description}</p>}

 <div style={{ marginBottom: '1.25rem' }}>
 <span style={{ fontSize: '2rem', fontWeight: 800, color: '#F1F5F9' }}>{p.currency} {Number(p.price).toFixed(2)}</span>
 <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>/{INTERVAL_LABEL[p.interval] || p.interval}</span>
 </div>

 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F0F2F8' }}>
 Hasta {p.maxCases} casos activos · {p.maxClients} clientes
 </div>

 {features.length > 0 && (
 <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
 {features.map(f => (
 <li key={f} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
 <CheckIcon size={13} stroke="#34D399" /> {f}
 </li>
 ))}
 </ul>
 )}

 <button
 onClick={() => handleSubscribe(p.id)}
 disabled={isCurrent || subscribing === p.id}
 className={isCurrent ? 'btn btn-secondary' : 'btn btn-primary'}
 style={{ width: '100%' }}
 >
 {subscribing === p.id ? 'Procesando...' : isCurrent ? 'Plan activo' : current ? 'Cambiar a este plan' : 'Suscribirme'}
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
