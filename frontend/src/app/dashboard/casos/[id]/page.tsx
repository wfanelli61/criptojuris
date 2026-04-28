'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import SignatureCanvas from '@/components/SignatureCanvas';

const STATUS_LABEL: Record<string, string> = {
 SOLICITUD: 'Solicitud', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
 PRESUPUESTO_APROBADO: 'Presupuesto aprobado', CONTRATO_FIRMADO: 'Contrato firmado',
 EN_CURSO: 'En curso', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
 SOLICITUD: { bg: '#F0B429', color: '#854D0E' },
 PRESUPUESTO_ENVIADO: { bg: '#F0B429', color: '#F59E0B' },
 PRESUPUESTO_APROBADO: { bg: '#34D399', color: '#34D399' },
 CONTRATO_FIRMADO: { bg: '#C084FC', color: '#60A5FA' },
 EN_CURSO: { bg: 'rgba(255,255,255,0.06)', color: '#5B21B6' },
 CERRADO: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
 CANCELADO: { bg: '#F87171', color: '#F87171' },
};
const DOC_TYPES = ['RECURSO', 'AMPARO', 'INCIDENTAL', 'OTRO'];

function Section({ title, icon, action, children }: { title: string; icon: string; action?: React.ReactNode; children: React.ReactNode }) {
 return (
 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '1rem' }}>
 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
 <span style={{ fontSize: '1.1rem' }}>{icon}</span>
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.95rem' }}>{title}</span>
 </div>
 {action}
 </div>
 <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
 </div>
 );
}

export default function CasoAbogadoPage() {
 const { id } = useParams<{ id: string }>();
 const [caso, setCaso] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 // Forms state
 const [budgetForm, setBudgetForm] = useState({ amount: '', description: '' });
 const [contractForm, setContractForm] = useState({ terms: '', fileUrl: '' });
 const [analysisForm, setAnalysisForm] = useState({ summary: '', strategy: '', route: '', risks: '' });
 const [docForm, setDocForm] = useState({ type: 'RECURSO', title: '', description: '', fileUrl: '', presentedAt: '' });
 const [invForm, setInvForm] = useState({ title: '', description: '', result: '', date: '' });

 // Modal open states
 const [openPanel, setOpenPanel] = useState('');
 const [actionLoading, setActionLoading] = useState('');
 const [showSignCanvas, setShowSignCanvas] = useState(false);

 const load = () => apiFetch(`/cases/${id}`).then(d => {
 setCaso(d.case);
 if (d.case.analysis) setAnalysisForm({ summary: d.case.analysis.summary, strategy: d.case.analysis.strategy, route: d.case.analysis.route, risks: d.case.analysis.risks || '' });
 if (d.case.budget) setBudgetForm({ amount: d.case.budget.amount, description: d.case.budget.description });
 if (d.case.contract) setContractForm({ terms: d.case.contract.terms, fileUrl: d.case.contract.fileUrl || '' });
 }).catch(() => {}).finally(() => setLoading(false));

 useEffect(() => { load(); }, [id]);

 const submit = async (endpoint: string, method: string, body: any, key: string) => {
 setActionLoading(key);
 try {
 await apiFetch(endpoint, { method, body: JSON.stringify(body) });
 await load();
 setOpenPanel('');
 } catch (e: any) { alert(e.message); }
 finally { setActionLoading(''); }
 };

 const deleteItem = async (endpoint: string, key: string) => {
 if (!confirm('¿Eliminar este elemento?')) return;
 setActionLoading(key);
 try { await apiFetch(endpoint, { method: 'DELETE' }); await load(); }
 catch (e: any) { alert(e.message); }
 finally { setActionLoading(''); }
 };

 const changeStatus = async (status: string) => {
 if (!confirm(`¿Cambiar estado a "${STATUS_LABEL[status]}"?`)) return;
 await submit(`/cases/${id}/status`, 'PATCH', { status }, 'status');
 };

 if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
 if (!caso) return <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.45)' }}>Caso no encontrado</div>;

 const st = STATUS_COLOR[caso.status] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };

 return (
 <div style={{ maxWidth: '800px', margin: '0 auto' }}>
 <Link href="/dashboard/casos" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.25rem' }}>
 ← Volver a expedientes
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
 <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
 <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
 <span style={{ color: '#F0B429', fontWeight: 600 }}>Área: </span>{caso.legalArea}
 </div>
 <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
 <span style={{ color: '#F0B429', fontWeight: 600 }}>Cliente: </span>{caso.client?.name}
 </div>
 {/* Cambiar estado */}
 <select onChange={e => changeStatus(e.target.value)} value={caso.status} style={{
 marginLeft: 'auto', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.78rem',
 border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
 color: '#fff', cursor: 'pointer',
 }}>
 {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k} style={{ color: '#000' }}>{v}</option>)}
 </select>
 </div>
 </div>

 {/* PRESUPUESTO */}
 <Section title="Presupuesto" icon="" action={
 <button onClick={() => setOpenPanel(openPanel === 'budget' ? '' : 'budget')} className="btn btn-secondary btn-sm">
 {caso.budget ? 'Editar' : '+ Crear'}
 </button>
 }>
 {openPanel === 'budget' && (
 <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Monto ($)</label>
 <input className="form-input" type="number" placeholder="0.00" value={budgetForm.amount} onChange={e => setBudgetForm(f => ({ ...f, amount: e.target.value }))} />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Descripción</label>
 <input className="form-input" placeholder="Honorarios + gastos..." value={budgetForm.description} onChange={e => setBudgetForm(f => ({ ...f, description: e.target.value }))} />
 </div>
 </div>
 <button onClick={() => submit(`/cases/${id}/budget`, 'POST', budgetForm, 'budget')} className="btn btn-primary btn-sm" disabled={actionLoading === 'budget'}>
 {actionLoading === 'budget' ? '...' : 'Guardar presupuesto'}
 </button>
 </div>
 )}
 {caso.budget ? (
 <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F1F5F9' }}>${Number(caso.budget.amount).toLocaleString()}</div>
 <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{caso.budget.description}</div>
 <span style={{
 padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
 background: caso.budget.status === 'APROBADO' ? '#D1FAE5' : caso.budget.status === 'RECHAZADO' ? '#FEE2E2' : '#FEF9C3',
 color: caso.budget.status === 'APROBADO' ? '#065F46' : caso.budget.status === 'RECHAZADO' ? '#991B1B' : '#854D0E',
 }}>{caso.budget.status}</span>
 </div>
 ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', margin: 0 }}>Sin presupuesto creado aún.</p>}
 </Section>

 {/* CONTRATO */}
 {showSignCanvas && (
 <SignatureCanvas
 signerLabel="Firmás como abogado del caso"
 onConfirm={async (sig) => {
 setShowSignCanvas(false);
 setActionLoading('lawyerSign');
 try {
 await apiFetch(`/cases/${id}/contract/sign`, { method: 'PATCH', body: JSON.stringify({ signature: sig }) });
 await load();
 } catch (e: any) { alert(e.message); }
 finally { setActionLoading(''); }
 }}
 onCancel={() => setShowSignCanvas(false)}
 />
 )}
 <Section title="Contrato de servicio" icon="" action={
 <button onClick={() => setOpenPanel(openPanel === 'contract' ? '' : 'contract')} className="btn btn-secondary btn-sm">
 {caso.contract ? 'Editar' : '+ Crear'}
 </button>
 }>
 {openPanel === 'contract' && (
 <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <div className="form-group" style={{ marginBottom: '0.75rem' }}>
 <label className="form-label">Términos del contrato</label>
 <textarea className="form-input" rows={4} value={contractForm.terms} onChange={e => setContractForm(f => ({ ...f, terms: e.target.value }))} style={{ resize: 'vertical' }} />
 </div>
 <div className="form-group" style={{ marginBottom: '0.75rem' }}>
 <label className="form-label">URL del documento (opcional)</label>
 <input className="form-input" placeholder="https://..." value={contractForm.fileUrl} onChange={e => setContractForm(f => ({ ...f, fileUrl: e.target.value }))} />
 </div>
 <button onClick={() => submit(`/cases/${id}/contract`, 'POST', contractForm, 'contract')} className="btn btn-primary btn-sm" disabled={actionLoading === 'contract'}>
 {actionLoading === 'contract' ? '...' : 'Guardar contrato'}
 </button>
 </div>
 )}
 {caso.contract ? (
 <div>
 <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1rem' }}>{caso.contract.terms}</p>

 {/* Estado de firmas */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', background: caso.contract.lawyerSignature ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)' }}>
 <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Tu firma</div>
 {caso.contract.lawyerSignature ? (
 <>
 <img src={caso.contract.lawyerSignature} alt="Tu firma" style={{ width: '100%', height: '60px', objectFit: 'contain', border: '1px solid #D1FAE5', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.04)' }} />
 <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.3rem', fontWeight: 600 }}>
 ✓ {caso.contract.lawyerSignedAt ? new Date(caso.contract.lawyerSignedAt).toLocaleDateString('es-VE') : 'Firmado'}
 </div>
 </>
 ) : (
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Pendiente de tu firma</div>
 )}
 </div>
 <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', background: caso.contract.clientSignature ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)' }}>
 <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Firma del cliente</div>
 {caso.contract.clientSignature ? (
 <>
 <img src={caso.contract.clientSignature} alt="Firma cliente" style={{ width: '100%', height: '60px', objectFit: 'contain', border: '1px solid #D1FAE5', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.04)' }} />
 <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.3rem', fontWeight: 600 }}>
 ✓ {caso.contract.clientSignedAt ? new Date(caso.contract.clientSignedAt).toLocaleDateString('es-VE') : 'Firmado'}
 </div>
 </>
 ) : (
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Pendiente firma del cliente</div>
 )}
 </div>
 </div>

 {caso.contract.signatureHash && (
 <div style={{ padding: '0.6rem 1rem', background: 'rgba(59,130,246,0.08)', borderRadius: '0.5rem', borderLeft: '3px solid #1B4D8F', marginBottom: '0.75rem' }}>
 <div style={{ fontSize: '0.7rem', color: '#60A5FA', fontWeight: 700 }}> Documento certificado</div>
 <div style={{ fontSize: '0.65rem', color: '#3B82F6', fontFamily: 'monospace', wordBreak: 'break-all' }}>SHA-256: {caso.contract.signatureHash}</div>
 </div>
 )}

 {!caso.contract.lawyerSignature && (
 <button onClick={() => setShowSignCanvas(true)} className="btn btn-primary btn-sm" disabled={actionLoading === 'lawyerSign'}>
 {actionLoading === 'lawyerSign' ? '...' : ' Firmar como abogado'}
 </button>
 )}
 </div>
 ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', margin: 0 }}>Sin contrato creado aún.</p>}
 </Section>

 {/* ANÁLISIS */}
 <Section title="Análisis del caso" icon="" action={
 <button onClick={() => setOpenPanel(openPanel === 'analysis' ? '' : 'analysis')} className="btn btn-secondary btn-sm">
 {caso.analysis ? 'Editar' : '+ Crear'}
 </button>
 }>
 {openPanel === 'analysis' && (
 <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 {[
 { key: 'summary', label: 'Resumen del caso', placeholder: 'Descripción general de la situación...' },
 { key: 'strategy', label: 'Estrategia legal', placeholder: 'Línea de defensa / acción...' },
 { key: 'route', label: 'Ruta a seguir', placeholder: 'Pasos concretos del proceso...' },
 { key: 'risks', label: 'Riesgos (opcional)', placeholder: 'Posibles complicaciones...' },
 ].map(f => (
 <div key={f.key} className="form-group" style={{ marginBottom: '0.75rem' }}>
 <label className="form-label">{f.label}</label>
 <textarea className="form-input" rows={3} placeholder={f.placeholder}
 value={(analysisForm as any)[f.key]}
 onChange={e => setAnalysisForm(a => ({ ...a, [f.key]: e.target.value }))}
 style={{ resize: 'vertical' }}
 />
 </div>
 ))}
 <button onClick={() => submit(`/cases/${id}/analysis`, 'POST', analysisForm, 'analysis')} className="btn btn-primary btn-sm" disabled={actionLoading === 'analysis'}>
 {actionLoading === 'analysis' ? '...' : 'Guardar análisis'}
 </button>
 </div>
 )}
 {caso.analysis ? (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 <div><strong style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Resumen</strong><p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>{caso.analysis.summary}</p></div>
 <div><strong style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Estrategia</strong><p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>{caso.analysis.strategy}</p></div>
 <div style={{ background: 'rgba(27,77,143,0.12)', borderRadius: '0.5rem', padding: '0.75rem', borderLeft: '3px solid #F0B429' }}>
 <strong style={{ fontSize: '0.78rem', color: '#F1F5F9', textTransform: 'uppercase' }}>Ruta a seguir</strong>
 <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>{caso.analysis.route}</p>
 </div>
 </div>
 ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', margin: 0 }}>Sin análisis registrado aún.</p>}
 </Section>

 {/* ESCRITOS */}
 <Section title={`Escritos (${caso.documents?.length || 0})`} icon="📎" action={
 <button onClick={() => setOpenPanel(openPanel === 'doc' ? '' : 'doc')} className="btn btn-secondary btn-sm">+ Agregar</button>
 }>
 {openPanel === 'doc' && (
 <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Tipo</label>
 <select className="form-input" value={docForm.type} onChange={e => setDocForm(f => ({ ...f, type: e.target.value }))}>
 {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Título</label>
 <input className="form-input" value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} />
 </div>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">URL del documento</label>
 <input className="form-input" placeholder="https://..." value={docForm.fileUrl} onChange={e => setDocForm(f => ({ ...f, fileUrl: e.target.value }))} />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Fecha presentación</label>
 <input className="form-input" type="date" value={docForm.presentedAt} onChange={e => setDocForm(f => ({ ...f, presentedAt: e.target.value }))} />
 </div>
 </div>
 <button onClick={() => submit(`/cases/${id}/documents`, 'POST', docForm, 'doc')} className="btn btn-primary btn-sm" disabled={actionLoading === 'doc'}>
 {actionLoading === 'doc' ? '...' : 'Agregar escrito'}
 </button>
 </div>
 )}
 {caso.documents?.length > 0 ? (
 <div style={{ display: 'grid', gap: '0.5rem' }}>
 {caso.documents.map((doc: any) => (
 <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <span style={{ fontSize: '1.1rem' }}></span>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F1F5F9' }}>{doc.title}</div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{doc.type} {doc.presentedAt && `· ${new Date(doc.presentedAt).toLocaleDateString('es-VE')}`}</div>
 </div>
 {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Ver</a>}
 <button onClick={() => deleteItem(`/cases/${id}/documents/${doc.id}`, `del-doc-${doc.id}`)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
 </div>
 ))}
 </div>
 ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', margin: 0 }}>Sin escritos registrados.</p>}
 </Section>

 {/* DILIGENCIAS */}
 <Section title={`Diligencias (${caso.investigations?.length || 0})`} icon="🔎" action={
 <button onClick={() => setOpenPanel(openPanel === 'inv' ? '' : 'inv')} className="btn btn-secondary btn-sm">+ Agregar</button>
 }>
 {openPanel === 'inv' && (
 <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Título</label>
 <input className="form-input" placeholder="Ej: Audiencia preliminar" value={invForm.title} onChange={e => setInvForm(f => ({ ...f, title: e.target.value }))} />
 </div>
 <div className="form-group" style={{ margin: 0 }}>
 <label className="form-label">Fecha</label>
 <input className="form-input" type="date" value={invForm.date} onChange={e => setInvForm(f => ({ ...f, date: e.target.value }))} />
 </div>
 </div>
 <div className="form-group" style={{ marginBottom: '0.75rem' }}>
 <label className="form-label">Descripción</label>
 <textarea className="form-input" rows={2} value={invForm.description} onChange={e => setInvForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
 </div>
 <div className="form-group" style={{ marginBottom: '0.75rem' }}>
 <label className="form-label">Resultado</label>
 <input className="form-input" placeholder="Resultado de la diligencia..." value={invForm.result} onChange={e => setInvForm(f => ({ ...f, result: e.target.value }))} />
 </div>
 <button onClick={() => submit(`/cases/${id}/investigations`, 'POST', invForm, 'inv')} className="btn btn-primary btn-sm" disabled={actionLoading === 'inv'}>
 {actionLoading === 'inv' ? '...' : 'Agregar diligencia'}
 </button>
 </div>
 )}
 {caso.investigations?.length > 0 ? (
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 {caso.investigations.map((inv: any) => (
 <div key={inv.id} style={{ paddingLeft: '1rem', borderLeft: '3px solid rgba(255,255,255,0.15)', position: 'relative' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div>
 <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.88rem' }}>{inv.title}</span>
 <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.5rem' }}>{new Date(inv.date).toLocaleDateString('es-VE')}</span>
 </div>
 <button onClick={() => deleteItem(`/cases/${id}/investigations/${inv.id}`, `del-inv-${inv.id}`)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button>
 </div>
 <p style={{ margin: '0.2rem 0 0', fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)' }}>{inv.description}</p>
 {inv.result && <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>✓ {inv.result}</div>}
 </div>
 ))}
 </div>
 ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', margin: 0 }}>Sin diligencias registradas.</p>}
 </Section>
 </div>
 );
}
