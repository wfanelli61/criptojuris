'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { FileIcon, ShieldIcon, BriefcaseIcon, MessageIcon, AlertIcon, LockIcon, BookIcon, DownloadIcon, CheckIcon, RefreshIcon } from '@/components/Icons';

const DOC_TYPES = [
 { value: 'PODER_NOTARIAL',          label: 'Poder Notarial',               Icon: ShieldIcon,    desc: 'Autoriza a otra persona a actuar en tu nombre' },
 { value: 'CONTRATO_SERVICIOS',      label: 'Contrato de Servicios',        Icon: BriefcaseIcon, desc: 'Acuerdo de prestación de servicios profesionales' },
 { value: 'CARTA_RECLAMO',           label: 'Carta de Reclamo',             Icon: MessageIcon,   desc: 'Reclamo formal a una empresa o persona' },
 { value: 'DENUNCIA',                label: 'Escrito de Denuncia',          Icon: AlertIcon,     desc: 'Denuncia ante autoridades competentes' },
 { value: 'ACUERDO_CONFIDENCIALIDAD',label: 'Acuerdo de Confidencialidad',  Icon: LockIcon,      desc: 'Protege información sensible entre partes' },
 { value: 'SOLICITUD_ADMINISTRATIVA',label: 'Solicitud Administrativa',     Icon: BookIcon,      desc: 'Solicitud formal ante un organismo público' },
];

const PARTY_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
 PODER_NOTARIAL: [
 { key: 'poderdante', label: 'Poderdante (quien otorga el poder)', placeholder: 'Nombre completo, CI, domicilio' },
 { key: 'apoderado', label: 'Apoderado (quien recibe el poder)', placeholder: 'Nombre completo, CI' },
 { key: 'facultades', label: 'Facultades otorgadas', placeholder: 'Ej: para firmar documentos, cobrar cheques, representar ante tribunales...' },
 ],
 CONTRATO_SERVICIOS: [
 { key: 'contratante', label: 'Contratante (quien contrata)', placeholder: 'Nombre/empresa, RIF/CI, domicilio' },
 { key: 'contratado', label: 'Contratado (quien presta el servicio)', placeholder: 'Nombre/empresa, RIF/CI, domicilio' },
 { key: 'servicio', label: 'Descripción del servicio', placeholder: 'Qué servicio se presta' },
 { key: 'honorarios', label: 'Honorarios y forma de pago', placeholder: 'Monto, moneda, forma de pago' },
 ],
 CARTA_RECLAMO: [
 { key: 'remitente', label: 'Remitente (quién reclama)', placeholder: 'Nombre, CI, contacto' },
 { key: 'destinatario', label: 'Destinatario (a quién se reclama)', placeholder: 'Empresa/persona, dirección' },
 { key: 'objeto', label: 'Objeto del reclamo', placeholder: 'Qué se reclama y por qué' },
 ],
 DENUNCIA: [
 { key: 'denunciante', label: 'Denunciante', placeholder: 'Nombre, CI, domicilio, contacto' },
 { key: 'denunciado', label: 'Denunciado/s', placeholder: 'Nombre(s) de los denunciados, si se conocen' },
 { key: 'organismo', label: 'Organismo receptor', placeholder: 'Ej: Fiscalía, INDEPABIS, Defensoría del Pueblo...' },
 ],
 ACUERDO_CONFIDENCIALIDAD: [
 { key: 'parte1', label: 'Primera parte', placeholder: 'Nombre/empresa, CI/RIF, domicilio' },
 { key: 'parte2', label: 'Segunda parte', placeholder: 'Nombre/empresa, CI/RIF, domicilio' },
 { key: 'informacion', label: 'Información confidencial a proteger', placeholder: 'Qué tipo de información se protege' },
 { key: 'duracion', label: 'Duración del acuerdo', placeholder: 'Ej: 2 años desde la firma' },
 ],
 SOLICITUD_ADMINISTRATIVA: [
 { key: 'solicitante', label: 'Solicitante', placeholder: 'Nombre, CI, domicilio, contacto' },
 { key: 'organismo', label: 'Organismo al que se dirige', placeholder: 'Nombre del organismo, dependencia' },
 { key: 'objeto', label: 'Objeto de la solicitud', placeholder: 'Qué se solicita exactamente' },
 ],
};

export default function GenerarDocumentoPage() {
 const [step, setStep] = useState<'select' | 'form' | 'result'>('select');
 const [docType, setDocType] = useState('');
 const [parties, setParties] = useState<Record<string, string>>({});
 const [details, setDetails] = useState('');
 const [loading, setLoading] = useState(false);
 const [result, setResult] = useState<{ document: string; typeName: string } | null>(null);
 const [error, setError] = useState('');
 const [copied, setCopied] = useState(false);

 const selectType = (type: string) => { setDocType(type); setParties({}); setStep('form'); };

 const generate = async () => {
 setError('');
 setLoading(true);
 try {
 const data = await apiFetch('/ai/generate-document', {
 method: 'POST',
 body: JSON.stringify({ type: docType, parties, details }),
 });
 setResult(data);
 setStep('result');
 } catch (e: any) {
 setError(e.message || 'Error al generar el documento. Verifica que la API key esté configurada.');
 }
 setLoading(false);
 };

 const copyToClipboard = () => {
 if (!result) return;
 navigator.clipboard.writeText(result.document);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const downloadTxt = () => {
 if (!result) return;
 const blob = new Blob([result.document], { type: 'text/plain;charset=utf-8' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${result.typeName.replace(/ /g, '_')}.txt`;
 a.click();
 URL.revokeObjectURL(url);
 };

 const fields = PARTY_FIELDS[docType] || [];
 const selectedDoc = DOC_TYPES.find(d => d.value === docType);

 return (
 <div style={{ maxWidth: '760px', margin: '0 auto' }}>
 <Link href="/dashboard/metricas" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.25rem' }}>
 ← Volver
 </Link>

 {/* Header */}
 <div style={{ background: 'linear-gradient(135deg,#6D28D9 0%,#8B5CF6 100%)', borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.5rem', color: '#fff' }}>
 <div style={{ marginBottom: '0.75rem', opacity: 0.85 }}>
 <FileIcon size={36} stroke="#E9D5FF" />
 </div>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
 Generador de documentos legales
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', margin: 0 }}>
 Selecciona el tipo de documento, completa los datos y la IA lo redactará en formato legal venezolano.
 </p>
 </div>

 {/* PASO 1: Seleccionar tipo */}
 {step === 'select' && (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
 {DOC_TYPES.map(dt => (
 <button key={dt.value} onClick={() => selectType(dt.value)} style={{
 background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem',
 padding: '1.25rem', textAlign: 'left', cursor: 'pointer',
 transition: 'all 0.2s', outline: 'none',
 }}
 onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(139,92,246,0.5)'; el.style.background = 'rgba(139,92,246,0.1)'; }}
 onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.background = 'rgba(255,255,255,0.04)'; }}
 >
 <div style={{ marginBottom: '0.75rem', color: '#A78BFA' }}>
 <dt.Icon size={28} />
 </div>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{dt.label}</div>
 <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{dt.desc}</div>
 </button>
 ))}
 </div>
 )}

 {/* PASO 2: Formulario */}
 {step === 'form' && selectedDoc && (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
 <div style={{ color: '#A78BFA' }}>
 <selectedDoc.Icon size={22} />
 </div>
 <div>
 <div style={{ fontWeight: 700, color: '#F1F5F9' }}>{selectedDoc.label}</div>
 <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}>← Cambiar tipo</button>
 </div>
 </div>

 <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', marginBottom: '1rem' }}>
 {fields.map(f => (
 <div key={f.key} style={{ marginBottom: '1.1rem' }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
 {f.label}
 </label>
 <textarea
 rows={2}
 placeholder={f.placeholder}
 value={parties[f.key] || ''}
 onChange={e => setParties(p => ({ ...p, [f.key]: e.target.value }))}
 style={{
 width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.6rem',
 border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', resize: 'vertical',
 fontFamily: 'inherit', color: '#F1F5F9', outline: 'none', boxSizing: 'border-box',
 background: 'rgba(255,255,255,0.06)',
 }}
 />
 </div>
 ))}

 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
 Detalles adicionales (opcional)
 </label>
 <textarea
 rows={3}
 placeholder="Cualquier detalle adicional que deba incluirse en el documento..."
 value={details}
 onChange={e => setDetails(e.target.value)}
 maxLength={2000}
 style={{
 width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.6rem',
 border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', resize: 'vertical',
 fontFamily: 'inherit', color: '#F1F5F9', outline: 'none', boxSizing: 'border-box',
 background: 'rgba(255,255,255,0.06)',
 }}
 />
 </div>
 </div>

 {error && (
 <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.6rem', color: '#F87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
 {error}
 </div>
 )}

 <button onClick={generate} disabled={loading} style={{
 width: '100%', padding: '0.9rem', borderRadius: '0.6rem', border: 'none',
 background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
 color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
 }}>
 {loading ? (
 <>
 <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
 Redactando documento...
 </>
 ) : <><FileIcon size={16} /> Generar documento</>}
 </button>
 <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '0.75rem' }}>
 Revisa siempre el documento con un abogado antes de usarlo oficialmente.
 </p>
 </div>
 )}

 {/* PASO 3: Resultado */}
 {step === 'result' && result && (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
 <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '1rem' }}>
 {result.typeName} generado
 </div>
 <div style={{ display: 'flex', gap: '0.5rem' }}>
 <button onClick={copyToClipboard} style={{
 padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.12)',
 background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
 color: copied ? '#34D399' : 'rgba(255,255,255,0.7)',
 fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
 display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
 }}>
 {copied ? <><CheckIcon size={13} /> Copiado</> : 'Copiar'}
 </button>
 <button onClick={downloadTxt} style={{
 padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
 background: '#6D28D9', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
 display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
 }}>
 <DownloadIcon size={13} /> Descargar .txt
 </button>
 </div>
 </div>

 <div style={{
 background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)',
 padding: '2rem', marginBottom: '1rem',
 fontFamily: 'Georgia, serif', fontSize: '0.9rem', lineHeight: 1.8,
 color: '#E2E8F0', whiteSpace: 'pre-wrap', maxHeight: '600px', overflowY: 'auto',
 }}>
 {result.document}
 </div>

 <div style={{ padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.6rem', borderLeft: '3px solid #F59E0B', marginBottom: '1.25rem' }}>
 <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
 Este documento fue generado por IA con fines orientativos. Debe ser revisado y certificado por un abogado habilitado antes de tener validez legal.
 </p>
 </div>

 <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
 <button onClick={() => { setStep('select'); setResult(null); setDetails(''); setParties({}); }} style={{
 padding: '0.65rem 1.25rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.12)',
 background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)',
 fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
 display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
 }}>
 <RefreshIcon size={14} /> Nuevo documento
 </button>
 <Link href="/abogados" style={{ textDecoration: 'none' }}>
 <button style={{
 padding: '0.65rem 1.25rem', borderRadius: '0.6rem', border: 'none',
 background: 'linear-gradient(135deg,#0C2340,#1B4D8F)', color: '#fff',
 fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
 }}>
 Consultar con abogado
 </button>
 </Link>
 </div>
 </div>
 )}

 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 </div>
 );
}
