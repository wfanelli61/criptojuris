'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const AREAS = [
 { value: 'PENAL', label: 'Derecho Penal', desc: 'Delitos, defensa criminal, procesos penales', icon: '' },
 { value: 'CIVIL', label: 'Derecho Civil', desc: 'Contratos, demandas, propiedad, herencias', icon: '📜' },
 { value: 'LOPNA', label: 'LOPNA', desc: 'Protección del niño, niña y adolescente', icon: '👶' },
 { value: 'CORPORATIVO', label: 'Corporativo', desc: 'Empresas, sociedades, gestión legal empresarial', icon: '🏢' },
];

export default function NuevoCasoPage() {
 const router = useRouter();
 const [step, setStep] = useState(1);
 const [form, setForm] = useState({ title: '', description: '', legalArea: '' });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async () => {
 if (!form.title || !form.legalArea) { setError('Completá todos los campos obligatorios'); return; }
 setLoading(true); setError('');
 try {
 const data = await apiFetch('/cases', { method: 'POST', body: JSON.stringify(form) });
 router.push(`/dashboard/mis-casos/${data.case.id}`);
 } catch (e: any) {
 setError(e.message || 'Error al crear el caso');
 } finally { setLoading(false); }
 };

 return (
 <div style={{ maxWidth: '640px', margin: '0 auto' }}>
 {/* Header */}
 <div style={{ marginBottom: '2rem' }}>
 <Link href="/dashboard/mis-casos" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
 ← Volver a mis casos
 </Link>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>
 Solicitar asesoría legal
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
 Describí tu situación y un abogado especializado se asignará a tu caso.
 </p>
 </div>

 {/* Steps indicator */}
 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
 {[1, 2].map(s => (
 <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <div style={{
 width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '0.78rem', fontWeight: 700,
 background: step >= s ? 'rgba(240,180,41,0.2)' : 'rgba(255,255,255,0.08)',
 color: step >= s ? '#F0B429' : 'rgba(255,255,255,0.35)',
 }}>{s}</div>
 <span style={{ fontSize: '0.82rem', color: step >= s ? '#F0B429' : 'rgba(255,255,255,0.4)', fontWeight: step === s ? 600 : 400 }}>
 {s === 1 ? 'Área jurídica' : 'Detalles del caso'}
 </span>
 {s < 2 && <div style={{ width: '2rem', height: '1px', background: step > s ? 'rgba(240,180,41,0.4)' : 'rgba(255,255,255,0.08)' }} />}
 </div>
 ))}
 </div>

 <div className="card" style={{ padding: '2rem' }}>
 {step === 1 && (
 <div>
 <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '1.25rem' }}>
 ¿En qué área necesitás ayuda?
 </h2>
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {AREAS.map(a => (
 <button key={a.value} onClick={() => setForm(f => ({ ...f, legalArea: a.value }))} style={{
 display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
 borderRadius: '0.75rem', border: '2px solid',
 borderColor: form.legalArea === a.value ? '#F0B429' : 'rgba(255,255,255,0.08)',
 background: form.legalArea === a.value ? 'rgba(240,180,41,0.1)' : 'rgba(255,255,255,0.04)',
 cursor: 'pointer', textAlign: 'left', width: '100%',
 transition: 'all 0.15s',
 }}>
 <span style={{ fontSize: '1.75rem' }}>{a.icon}</span>
 <div>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.95rem' }}>{a.label}</div>
 <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: '0.1rem' }}>{a.desc}</div>
 </div>
 {form.legalArea === a.value && (
 <span style={{ marginLeft: 'auto', color: '#F0B429', fontWeight: 700 }}>✓</span>
 )}
 </button>
 ))}
 </div>
 <button
 onClick={() => { if (!form.legalArea) { setError('Seleccioná un área'); return; } setError(''); setStep(2); }}
 className="btn btn-primary"
 style={{ width: '100%', marginTop: '1.5rem' }}
 >
 Continuar →
 </button>
 {error && <p style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: '0.75rem', textAlign: 'center' }}>{error}</p>}
 </div>
 )}

 {step === 2 && (
 <div>
 <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '1.25rem' }}>
 Contanos sobre tu caso
 </h2>
 <div className="form-group" style={{ marginBottom: '1rem' }}>
 <label className="form-label">Título del caso *</label>
 <input
 className="form-input"
 placeholder="Ej: Defensa por acusación de robo, Divorcio contencioso..."
 value={form.title}
 onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
 />
 </div>
 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
 <label className="form-label">Descripción de la situación</label>
 <textarea
 className="form-input"
 rows={5}
 placeholder="Describí brevemente tu situación, qué pasó, qué necesitás..."
 value={form.description}
 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
 style={{ resize: 'vertical' }}
 />
 </div>
 {error && <p style={{ color: '#EF4444', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
 <div style={{ display: 'flex', gap: '0.75rem' }}>
 <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>← Atrás</button>
 <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
 {loading ? 'Enviando...' : 'Enviar solicitud'}
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
