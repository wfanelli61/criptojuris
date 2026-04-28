'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import SignatureCanvas from '@/components/SignatureCanvas';

const STATUS_LABEL: Record<string, string> = {
 SOLICITUD: 'Solicitud enviada', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
 PRESUPUESTO_APROBADO: 'Presupuesto aprobado', CONTRATO_FIRMADO: 'Contrato firmado',
 EN_CURSO: 'En curso', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
 SOLICITUD: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429' },
 PRESUPUESTO_ENVIADO: { bg: 'rgba(240,180,41,0.18)', color: '#F0B429' },
 PRESUPUESTO_APROBADO: { bg: 'rgba(52,211,153,0.18)', color: '#34D399' },
 CONTRATO_FIRMADO: { bg: 'rgba(192,132,252,0.18)', color: '#C084FC' },
 EN_CURSO: { bg: 'rgba(96,165,250,0.18)', color: '#60A5FA' },
 CERRADO: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
 CANCELADO: { bg: 'rgba(248,113,113,0.18)', color: '#F87171' },
};
const DOC_LABEL: Record<string, string> = { RECURSO: 'Recurso', AMPARO: 'Amparo', INCIDENTAL: 'Incidental', OTRO: 'Documento' };

const STEPS = ['SOLICITUD','PRESUPUESTO_ENVIADO','PRESUPUESTO_APROBADO','CONTRATO_FIRMADO','EN_CURSO','CERRADO'] as const;

const STEP_META: Record<string, { icon: string; title: string; desc: string }> = {
 SOLICITUD: { icon: '', title: 'Solicitud enviada', desc: 'Tu caso fue registrado en el sistema' },
 PRESUPUESTO_ENVIADO: { icon: '', title: 'Presupuesto enviado', desc: 'El abogado envió el presupuesto del servicio' },
 PRESUPUESTO_APROBADO: { icon: '', title: 'Presupuesto aprobado', desc: 'Aprobaste el presupuesto propuesto' },
 CONTRATO_FIRMADO: { icon: '', title: 'Contrato firmado', desc: 'Ambas partes firmaron el contrato digital' },
 EN_CURSO: { icon: '', title: 'Caso en curso', desc: 'El abogado está trabajando activamente' },
 CERRADO: { icon: '🏁', title: 'Caso cerrado', desc: 'El expediente fue cerrado exitosamente' },
};

function fmtDate(d: string | null | undefined) {
 if (!d) return '';
 return new Date(d).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
 return (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '1rem' }}>
 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
 <span style={{ fontSize: '1.1rem' }}>{icon}</span>
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.95rem' }}>{title}</span>
 </div>
 <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
 </div>
 );
}

export default function CasoDetallePage() {
 const { id } = useParams<{ id: string }>();
 const router = useRouter();
 const [caso, setCaso] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState('');
 const [showSignCanvas, setShowSignCanvas] = useState(false);
 const [review, setReview] = useState<any>(null);
 const [reviewRating, setReviewRating] = useState(5);
 const [reviewComment, setReviewComment] = useState('');
 const [reviewSubmitting, setReviewSubmitting] = useState(false);
 const [reviewDone, setReviewDone] = useState(false);

 const [payments, setPayments] = useState<any[]>([]);
 const [payForm, setPayForm] = useState({ amount: '', currency: 'USD', method: 'PAGO_MOVIL', reference: '', bank: '', phone: '', concept: '' });
 const [payLoading, setPayLoading] = useState(false);
 const [showPayForm, setShowPayForm] = useState(false);

 const load = () => apiFetch(`/cases/${id}`).then(d => setCaso(d.case)).catch(() => {}).finally(() => setLoading(false));
 const loadReview = () => apiFetch(`/reviews/case/${id}`).then(d => { setReview(d.review); if (d.review) setReviewDone(true); }).catch(() => {});
 const loadPayments = () => apiFetch(`/payments/case/${id}`).then(d => setPayments(d.payments || [])).catch(() => {});
 useEffect(() => { load(); loadReview(); loadPayments(); }, [id]);

 const submitPayment = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!payForm.amount || Number(payForm.amount) <= 0) return alert('Ingresa un monto válido');
 setPayLoading(true);
 try {
 await apiFetch('/payments', { method: 'POST', body: JSON.stringify({ caseId: id, ...payForm, amount: Number(payForm.amount) }) });
 setPayForm({ amount: '', currency: 'USD', method: 'PAGO_MOVIL', reference: '', bank: '', phone: '', concept: '' });
 setShowPayForm(false);
 await loadPayments();
 } catch (e: any) { alert(e.message); }
 finally { setPayLoading(false); }
 };

 const submitReview = async () => {
 setReviewSubmitting(true);
 try {
 await apiFetch(`/reviews/${id}`, {
 method: 'POST',
 body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
 });
 setReviewDone(true);
 await loadReview();
 } catch (e: any) { alert(e.message); }
 finally { setReviewSubmitting(false); }
 };

 const openChat = async () => {
 if (!caso?.lawyer?.id) return;
 setActionLoading('chat');
 try {
 const conv = await apiFetch('/chat/conversations', { method: 'POST', body: JSON.stringify({ targetUserId: caso.lawyer.id }) });
 router.push(`/dashboard/chat?conv=${conv.id}`);
 } catch (e: any) { alert(e.message); }
 finally { setActionLoading(''); }
 };

 const respondBudget = async (approved: boolean) => {
 setActionLoading('budget');
 try {
 await apiFetch(`/cases/${id}/budget/respond`, { method: 'PATCH', body: JSON.stringify({ approved }) });
 await load();
 } catch (e: any) { alert(e.message); }
 finally { setActionLoading(''); }
 };

 const signContract = async (signatureBase64: string) => {
 setShowSignCanvas(false);
 setActionLoading('contract');
 try {
 await apiFetch(`/cases/${id}/contract/sign`, {
 method: 'PATCH',
 body: JSON.stringify({ signature: signatureBase64 }),
 });
 await load();
 } catch (e: any) { alert(e.message); }
 finally { setActionLoading(''); }
 };

 // ── Timeline de actividad derivada del caso ────────────────────────────
 const timeline = useMemo(() => {
 if (!caso) return [];
 const events: { date: string; icon: string; title: string; sub?: string; color: string }[] = [];

 events.push({ date: caso.createdAt, icon: '', title: 'Solicitud enviada', sub: `Expediente ${caso.caseNumber} creado`, color: '#F1F5F9' });

 if (caso.lawyer) {
 events.push({ date: caso.updatedAt, icon: '', title: `Abogado asignado: ${caso.lawyer.name}`, color: '#1B4D8F' });
 }

 if (caso.budget) {
 events.push({ date: caso.budget.createdAt, icon: '', title: 'Presupuesto enviado', sub: `$${Number(caso.budget.amount).toLocaleString()} — ${caso.budget.description}`, color: '#F59E0B' });
 if (caso.budget.status === 'APROBADO') {
 events.push({ date: caso.budget.updatedAt, icon: '', title: 'Presupuesto aprobado', color: '#34D399' });
 } else if (caso.budget.status === 'RECHAZADO') {
 events.push({ date: caso.budget.updatedAt, icon: '', title: 'Presupuesto rechazado', color: '#F87171' });
 }
 }

 if (caso.contract) {
 events.push({ date: caso.contract.createdAt, icon: '', title: 'Contrato preparado', sub: 'El abogado redactó los términos', color: '#60A5FA' });
 if (caso.contract.lawyerSignedAt) {
 events.push({ date: caso.contract.lawyerSignedAt, icon: '', title: `${caso.lawyer?.name || 'Abogado'} firmó el contrato`, color: '#5B21B6' });
 }
 if (caso.contract.clientSignedAt) {
 events.push({ date: caso.contract.clientSignedAt, icon: '', title: 'Firmaste el contrato', color: '#5B21B6' });
 }
 if (caso.contract.signatureHash) {
 events.push({ date: caso.contract.signedAt || caso.contract.updatedAt, icon: '', title: 'Contrato certificado digitalmente', sub: 'SHA-256 generado', color: '#059669' });
 }
 }

 if (caso.analysis) {
 events.push({ date: caso.analysis.createdAt, icon: '', title: 'Análisis del caso publicado', color: '#6D28D9' });
 }

 (caso.documents || []).forEach((doc: any) => {
 events.push({ date: doc.createdAt, icon: '📎', title: `Documento agregado: ${doc.title}`, sub: DOC_LABEL[doc.type], color: 'rgba(255,255,255,0.65)' });
 });

 (caso.investigations || []).forEach((inv: any) => {
 events.push({ date: inv.date, icon: '🔎', title: `Diligencia: ${inv.title}`, sub: inv.result ? `Resultado: ${inv.result}` : undefined, color: 'rgba(255,255,255,0.65)' });
 });

 if (caso.status === 'CERRADO') {
 events.push({ date: caso.updatedAt, icon: '🏁', title: 'Caso cerrado', color: 'rgba(255,255,255,0.65)' });
 }

 return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 }, [caso]);

 // ── Progreso del stepper ───────────────────────────────────────────────
 const stepDates = useMemo(() => {
 if (!caso) return {} as Record<string, string>;
 return {
 SOLICITUD: caso.createdAt,
 PRESUPUESTO_ENVIADO: caso.budget?.createdAt,
 PRESUPUESTO_APROBADO: caso.budget?.status === 'APROBADO' ? caso.budget?.updatedAt : null,
 CONTRATO_FIRMADO: caso.contract?.signedAt,
 EN_CURSO: caso.contract?.signedAt || (caso.status === 'EN_CURSO' ? caso.updatedAt : null),
 CERRADO: caso.status === 'CERRADO' ? caso.updatedAt : null,
 };
 }, [caso]);

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

 if (showSignCanvas) return (
 <SignatureCanvas
 signerLabel="Firmás como cliente del caso"
 onConfirm={signContract}
 onCancel={() => setShowSignCanvas(false)}
 />
 );
 if (!caso) return <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.45)' }}>Caso no encontrado</div>;

 const st = STATUS_COLOR[caso.status] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
 const currentIdx = STEPS.indexOf(caso.status as any);
 const isCancelled = caso.status === 'CANCELADO';

 // Porcentaje de progreso
 const progressPct = isCancelled ? 0 : Math.round(((currentIdx + 1) / STEPS.length) * 100);

 return (
 <div style={{ maxWidth: '760px', margin: '0 auto' }}>
 <Link href="/dashboard/mis-casos" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.25rem' }}>
 ← Volver a mis casos
 </Link>

 {/* Header */}
 <div style={{ background: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 100%)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.25rem', color: '#fff' }}>
 <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
 <div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Exp. {caso.caseNumber}</div>
 <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>{caso.title}</h1>
 {caso.description && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>{caso.description}</p>}
 </div>
 <span style={{ padding: '0.3rem 0.9rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: st.bg, color: st.color }}>
 {STATUS_LABEL[caso.status]}
 </span>
 </div>
 <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
 <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
 <span style={{ color: '#F0B429', fontWeight: 600 }}>Área: </span>{caso.legalArea}
 </div>
 {caso.lawyer ? (
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
 <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
 <span style={{ color: '#F0B429', fontWeight: 600 }}>Abogado: </span>{caso.lawyer.name}
 </div>
 <button onClick={openChat} disabled={actionLoading === 'chat'} style={{
 display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
 padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
 background: '#F0B429', color: '#F1F5F9', border: 'none', cursor: 'pointer',
 }}>
 {actionLoading === 'chat' ? '...' : `Chatear con ${caso.lawyer.name.split(' ')[0]}`}
 </button>
 </div>
 ) : (
 <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Sin abogado asignado aún</div>
 )}
 </div>

 {/* Barra de progreso */}
 {!isCancelled && (
 <div style={{ marginTop: '1.25rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
 <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>Progreso del expediente</span>
 <span style={{ fontSize: '0.72rem', color: '#F0B429', fontWeight: 700 }}>{progressPct}%</span>
 </div>
 <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
 <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#F0B429,#F6D365)', borderRadius: '9999px', transition: 'width 0.8s ease' }} />
 </div>
 </div>
 )}
 </div>

 {/* ── STEPPER VISUAL ─────────────────────────────────────────────── */}
 <Section title="Seguimiento del expediente" icon="📍">
 <div style={{ position: 'relative' }}>
 {/* Línea vertical de fondo */}
 <div style={{ position: 'absolute', left: '19px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px' }} />

 {STEPS.map((step, i) => {
 const done = currentIdx >= i && !isCancelled;
 const isCurrent = currentIdx === i && !isCancelled;
 const meta = STEP_META[step];
 const date = stepDates[step];

 return (
 <div key={step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: i < STEPS.length - 1 ? '1.25rem' : 0, position: 'relative' }}>
 {/* Círculo del paso */}
 <div style={{
 width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '1rem', zIndex: 1, position: 'relative',
 background: done ? (isCurrent ? 'rgba(240,180,41,0.15)' : 'rgba(16,185,129,0.1)') : 'rgba(255,255,255,0.03)',
 border: `2px solid ${done ? (isCurrent ? '#0C2340' : '#059669') : 'rgba(255,255,255,0.08)'}`,
 boxShadow: isCurrent ? '0 0 0 4px rgba(12,35,64,0.12)' : 'none',
 transition: 'all 0.3s',
 }}>
 {done && !isCurrent
 ? <span style={{ fontSize: '0.9rem' }}>✓</span>
 : <span>{meta.icon}</span>
 }
 </div>

 {/* Contenido del paso */}
 <div style={{ paddingTop: '0.5rem', flex: 1 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
 <span style={{
 fontWeight: isCurrent ? 700 : done ? 600 : 400,
 color: isCurrent ? '#F0B429' : done ? '#F1F5F9' : 'rgba(255,255,255,0.35)',
 fontSize: '0.88rem',
 }}>
 {meta.title}
 </span>
 {isCurrent && (
 <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(240,180,41,0.2)', color: '#F0B429' }}>
 ACTUAL
 </span>
 )}
 </div>
 <div style={{ fontSize: '0.75rem', color: done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', marginTop: '0.1rem' }}>
 {meta.desc}
 </div>
 {done && date && (
 <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>
 {fmtDate(date)}
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </Section>

 {/* Presupuesto */}
 {caso.budget && (
 <Section title="Presupuesto" icon="">
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F1F5F9' }}>${Number(caso.budget.amount).toLocaleString()}</div>
 <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{caso.budget.description}</div>
 </div>
 <div>
 {caso.budget.status === 'PENDIENTE' && (
 <div style={{ display: 'flex', gap: '0.5rem' }}>
 <button onClick={() => respondBudget(false)} className="btn btn-danger btn-sm" disabled={actionLoading === 'budget'}>Rechazar</button>
 <button onClick={() => respondBudget(true)} className="btn btn-success btn-sm" disabled={actionLoading === 'budget'}>
 {actionLoading === 'budget' ? '...' : 'Aprobar'}
 </button>
 </div>
 )}
 {caso.budget.status !== 'PENDIENTE' && (
 <span style={{
 padding: '0.3rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700,
 background: caso.budget.status === 'APROBADO' ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)',
 color: caso.budget.status === 'APROBADO' ? '#34D399' : '#F87171',
 }}>
 {caso.budget.status === 'APROBADO' ? '✓ Aprobado' : '✗ Rechazado'}
 </span>
 )}
 </div>
 </div>
 </Section>
 )}

 {/* ── PAGOS ──────────────────────────────────────────────────────── */}
 {(caso.budget?.status === 'APROBADO' || payments.length > 0) && (
 <Section title="Pagos" icon="💳">
 {/* Lista de pagos registrados */}
 {payments.length > 0 && (
 <div style={{ marginBottom: showPayForm ? '1.25rem' : 0 }}>
 {payments.map((p: any) => {
 const statusColor = p.status === 'CONFIRMADO' ? '#34D399' : p.status === 'RECHAZADO' ? '#F87171' : '#F0B429';
 const statusBg = p.status === 'CONFIRMADO' ? 'rgba(52,211,153,0.12)' : p.status === 'RECHAZADO' ? 'rgba(248,113,113,0.12)' : 'rgba(240,180,41,0.12)';
 const statusLabel = p.status === 'CONFIRMADO' ? '✓ Confirmado' : p.status === 'RECHAZADO' ? '✗ Rechazado' : '⏳ Pendiente';
 return (
 <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.65rem', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.6rem', gap: '0.75rem', flexWrap: 'wrap' }}>
 <div>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.95rem' }}>{p.currency} {Number(p.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
 {p.method.replace(/_/g,' ')} {p.bank ? `· ${p.bank}` : ''} {p.reference ? `· Ref: ${p.reference}` : ''} {p.phone ? `· ${p.phone}` : ''}
 </div>
 {p.concept && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>{p.concept}</div>}
 <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.1rem' }}>{fmtDate(p.createdAt)}</div>
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
 <span style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: statusBg, color: statusColor }}>
 {statusLabel}
 </span>
 {p.status === 'RECHAZADO' && p.rejectedReason && (
 <span style={{ fontSize: '0.68rem', color: '#F87171' }}>{p.rejectedReason}</span>
 )}
 {p.status === 'CONFIRMADO' && p.confirmedBy && (
 <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>por {p.confirmedBy.name}</span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Formulario de nuevo pago */}
 {!showPayForm ? (
 <button onClick={() => setShowPayForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.3)', borderRadius: '0.6rem', color: '#F0B429', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
 + Registrar pago
 </button>
 ) : (
 <form onSubmit={submitPayment} style={{ display: 'grid', gap: '0.85rem' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monto *</label>
 <input type="number" step="0.01" required placeholder="0.00" value={payForm.amount} onChange={e => setPayForm(f => ({...f, amount: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Moneda</label>
 <select value={payForm.currency} onChange={e => setPayForm(f => ({...f, currency: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}>
 <option value="USD">USD — Dólares</option>
 <option value="VES">VES — Bolívares</option>
 </select>
 </div>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Método de pago *</label>
 <select value={payForm.method} onChange={e => setPayForm(f => ({...f, method: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}>
 <option value="PAGO_MOVIL">📱 Pago Móvil</option>
 <option value="TRANSFERENCIA">🏦 Transferencia bancaria</option>
 <option value="ZELLE">💸 Zelle</option>
 <option value="EFECTIVO">💵 Efectivo</option>
 <option value="DIVISA">💱 Divisa (efectivo USD)</option>
 <option value="OTRO">Otro</option>
 </select>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>N° de referencia</label>
 <input placeholder="Ej: 00123456789" value={payForm.reference} onChange={e => setPayForm(f => ({...f, reference: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Banco emisor</label>
 <input placeholder="Ej: Banesco, Mercantil..." value={payForm.bank} onChange={e => setPayForm(f => ({...f, bank: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
 </div>
 </div>
 {payForm.method === 'PAGO_MOVIL' && (
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teléfono emisor</label>
 <input placeholder="04XX-XXX-XXXX" value={payForm.phone} onChange={e => setPayForm(f => ({...f, phone: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
 </div>
 )}
 <div>
 <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Concepto</label>
 <input placeholder="Ej: Honorarios caso laboral - primera cuota" value={payForm.concept} onChange={e => setPayForm(f => ({...f, concept: e.target.value}))} style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
 </div>
 <div style={{ display: 'flex', gap: '0.5rem' }}>
 <button type="submit" disabled={payLoading} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#F0B429,#C68A0A)', color: '#0C2340', borderRadius: '0.55rem', border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: payLoading ? 'not-allowed' : 'pointer', opacity: payLoading ? 0.7 : 1 }}>
 {payLoading ? 'Enviando...' : 'Registrar pago'}
 </button>
 <button type="button" onClick={() => setShowPayForm(false)} style={{ padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.55rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', cursor: 'pointer' }}>
 Cancelar
 </button>
 </div>
 <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
 El abogado confirmará el pago una vez que lo verifique. Guardá el comprobante.
 </p>
 </form>
 )}
 </Section>
 )}

 {/* Contrato */}
 {caso.contract && (
 <Section title="Contrato de Servicio" icon="">
 <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1rem' }}>{caso.contract.terms}</p>
 {caso.contract.fileUrl && (
 <a href={caso.contract.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#1B4D8F', fontSize: '0.85rem', textDecoration: 'underline', display: 'block', marginBottom: '1rem' }}>
 Ver documento adjunto
 </a>
 )}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
 <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', background: caso.contract.clientSignature ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)' }}>
 <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Tu firma</div>
 {caso.contract.clientSignature ? (
 <>
 <img src={caso.contract.clientSignature} alt="Tu firma" style={{ width: '100%', height: '60px', objectFit: 'contain', border: '1px solid #D1FAE5', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.04)' }} />
 <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.3rem', fontWeight: 600 }}>✓ {fmtDate(caso.contract.clientSignedAt)}</div>
 </>
 ) : (
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Pendiente de tu firma</div>
 )}
 </div>
 <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', background: caso.contract.lawyerSignature ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)' }}>
 <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Firma del abogado</div>
 {caso.contract.lawyerSignature ? (
 <>
 <img src={caso.contract.lawyerSignature} alt="Firma abogado" style={{ width: '100%', height: '60px', objectFit: 'contain', border: '1px solid #D1FAE5', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.04)' }} />
 <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.3rem', fontWeight: 600 }}>✓ {fmtDate(caso.contract.lawyerSignedAt)}</div>
 </>
 ) : (
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Pendiente firma del abogado</div>
 )}
 </div>
 </div>
 {caso.contract.signatureHash && (
 <div style={{ padding: '0.6rem 1rem', background: 'rgba(59,130,246,0.08)', borderRadius: '0.5rem', borderLeft: '3px solid #1B4D8F', marginBottom: '0.75rem' }}>
 <div style={{ fontSize: '0.7rem', color: '#60A5FA', fontWeight: 700, marginBottom: '0.1rem' }}> Documento certificado</div>
 <div style={{ fontSize: '0.65rem', color: '#3B82F6', fontFamily: 'monospace', wordBreak: 'break-all' }}>SHA-256: {caso.contract.signatureHash}</div>
 </div>
 )}
 {!caso.contract.clientSignature && (
 <button onClick={() => setShowSignCanvas(true)} className="btn btn-primary" disabled={actionLoading === 'contract'}>
 {actionLoading === 'contract' ? '...' : ' Firmar contrato'}
 </button>
 )}
 </Section>
 )}

 {/* Análisis */}
 {caso.analysis && (
 <Section title="Análisis del caso" icon="">
 <div style={{ display: 'grid', gap: '1rem' }}>
 <div>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.82rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumen</div>
 <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{caso.analysis.summary}</p>
 </div>
 <div>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.82rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estrategia</div>
 <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{caso.analysis.strategy}</p>
 </div>
 <div style={{ background: 'rgba(27,77,143,0.12)', borderRadius: '0.75rem', padding: '1rem', borderLeft: '3px solid #F0B429' }}>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Ruta a seguir</div>
 <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{caso.analysis.route}</p>
 </div>
 {caso.analysis.risks && (
 <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: '0.75rem', padding: '1rem', borderLeft: '3px solid #F59E0B' }}>
 <div style={{ fontWeight: 600, color: '#F0B429', fontSize: '0.82rem', marginBottom: '0.3rem' }}> Riesgos</div>
 <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{caso.analysis.risks}</p>
 </div>
 )}
 </div>
 </Section>
 )}

 {/* Escritos */}
 {caso.documents?.length > 0 && (
 <Section title={`Escritos y documentos (${caso.documents.length})`} icon="📎">
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {caso.documents.map((doc: any) => (
 <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <span style={{ fontSize: '1.25rem' }}></span>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.88rem' }}>{doc.title}</div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.1rem' }}>
 {DOC_LABEL[doc.type]} {doc.presentedAt && `· ${fmtDate(doc.presentedAt)}`}
 </div>
 </div>
 {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Ver</a>}
 </div>
 ))}
 </div>
 </Section>
 )}

 {/* Diligencias */}
 {caso.investigations?.length > 0 && (
 <Section title={`Diligencias (${caso.investigations.length})`} icon="🔎">
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {caso.investigations.map((inv: any) => (
 <div key={inv.id} style={{ paddingLeft: '1rem', borderLeft: '3px solid rgba(255,255,255,0.15)' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.88rem' }}>{inv.title}</span>
 <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{fmtDate(inv.date)}</span>
 </div>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', margin: 0, lineHeight: 1.6 }}>{inv.description}</p>
 {inv.result && <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Resultado: {inv.result}</div>}
 </div>
 ))}
 </div>
 </Section>
 )}

 {/* Normas vinculadas */}
 {caso.norms?.length > 0 && (
 <Section title={`Normas jurídicas (${caso.norms.length})`} icon="📚">
 <div style={{ display: 'grid', gap: '0.5rem' }}>
 {caso.norms.map((n: any) => (
 <div key={n.legalNormId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem' }}>
 <span style={{ fontSize: '1rem' }}></span>
 <div>
 <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.85rem' }}>{n.legalNorm.title}</div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{n.legalNorm.type} · {n.legalNorm.legalArea}</div>
 </div>
 </div>
 ))}
 </div>
 </Section>
 )}

 {/* ── TIMELINE DE ACTIVIDAD ─────────────────────────────────────────── */}
 {timeline.length > 0 && (
 <Section title="Historial de actividad" icon="🕐">
 <div style={{ position: 'relative' }}>
 <div style={{ position: 'absolute', left: '15px', top: '16px', bottom: '16px', width: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px' }} />
 {timeline.map((ev, i) => (
 <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', marginBottom: i < timeline.length - 1 ? '1rem' : 0 }}>
 <div style={{
 width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)',
 zIndex: 1, position: 'relative',
 }}>
 {ev.icon}
 </div>
 <div style={{ paddingTop: '0.35rem' }}>
 <div style={{ fontSize: '0.83rem', fontWeight: 600, color: ev.color }}>{ev.title}</div>
 {ev.sub && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.1rem' }}>{ev.sub}</div>}
 <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>{fmtDate(ev.date)}</div>
 </div>
 </div>
 ))}
 </div>
 </Section>
 )}

 {/* ── CALIFICACIÓN ─────────────────────────────────────────────────── */}
 {caso.status === 'CERRADO' && caso.lawyer && (
 <Section title="Calificación del servicio" icon="">
 {reviewDone && review ? (
 <div style={{ textAlign: 'center', padding: '1rem 0' }}>
 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
 {[1,2,3,4,5].map(n => (
 <span key={n} style={{ color: n <= review.rating ? '#F0B429' : 'rgba(255,255,255,0.08)' }}>★</span>
 ))}
 </div>
 <div style={{ fontWeight: 700, color: '#F1F5F9', marginBottom: '0.25rem' }}>
 {review.rating}/5 — {['','Malo','Regular','Bueno','Muy bueno','Excelente'][review.rating]}
 </div>
 {review.comment && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', fontStyle: 'italic', margin: '0.5rem 0 0' }}>"{review.comment}"</p>}
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Calificación enviada · {fmtDate(review.createdAt)}</div>
 </div>
 ) : (
 <div>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: '1rem' }}>
 ¿Cómo calificarías el trabajo de <strong>{caso.lawyer.name}</strong> en este caso?
 </p>
 {/* Estrellas interactivas */}
 <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
 {[1,2,3,4,5].map(n => (
 <button key={n} onClick={() => setReviewRating(n)} style={{
 fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer',
 color: n <= reviewRating ? '#F0B429' : 'rgba(255,255,255,0.08)',
 transition: 'color 0.15s, transform 0.1s',
 transform: n <= reviewRating ? 'scale(1.1)' : 'scale(1)',
 padding: 0,
 }}>★</button>
 ))}
 </div>
 <div style={{ fontSize: '0.82rem', color: '#F0B429', fontWeight: 600, marginBottom: '1rem' }}>
 {['','Malo','Regular','Bueno','Muy bueno','Excelente'][reviewRating]}
 </div>
 <textarea
 rows={3}
 placeholder="Comentario opcional (máx. 1000 caracteres)"
 maxLength={1000}
 value={reviewComment}
 onChange={e => setReviewComment(e.target.value)}
 style={{
 width: '100%', padding: '0.75rem', borderRadius: '0.6rem',
 border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.88rem', resize: 'vertical',
 fontFamily: 'inherit', color: 'rgba(255,255,255,0.65)', outline: 'none', boxSizing: 'border-box',
 }}
 />
 <button
 onClick={submitReview}
 disabled={reviewSubmitting}
 className="btn btn-primary"
 style={{ marginTop: '0.75rem' }}
 >
 {reviewSubmitting ? '...' : ' Enviar calificación'}
 </button>
 </div>
 )}
 </Section>
 )}
 </div>
 );
}
