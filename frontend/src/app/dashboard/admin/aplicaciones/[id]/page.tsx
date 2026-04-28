'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params);
 const router = useRouter();
 const [profile, setProfile] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [processing, setProcessing] = useState(false);

 useEffect(() => {
 apiFetch(`/admin/verifications/${id}`)
 .then(data => setProfile(data.profile))
 .catch(() => { })
 .finally(() => setLoading(false));
 }, [id]);

 const handleApprove = async () => {
 if (!confirm('¿Está seguro de aprobar a este abogado? Será visible en la página pública.')) return;
 setProcessing(true);
 try {
 await apiFetch(`/admin/verifications/${id}/approve`, { method: 'PUT' });
 alert('Abogado aprobado exitosamente');
 router.push('/dashboard/admin/verificaciones');
 } catch (err: any) {
 alert(err.message || 'Error al aprobar');
 } finally {
 setProcessing(false);
 }
 };

 const handleReject = async () => {
 if (!confirm('¿Está seguro de rechazar esta solicitud?')) return;
 setProcessing(true);
 try {
 await apiFetch(`/admin/verifications/${id}/reject`, { method: 'PUT' });
 alert('Solicitud rechazada');
 router.push('/dashboard/admin/verificaciones');
 } catch (err: any) {
 alert(err.message || 'Error al rechazar');
 } finally {
 setProcessing(false);
 }
 };

 if (loading) return <div className="spinner" />;
 if (!profile) return <div>No se encontró la solicitud.</div>;

 const v = profile.verification;

 const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
 <div style={{ marginBottom: '2.5rem' }}>
 <h3 style={{ borderBottom: '2px solid #F0B429', paddingBottom: '0.4rem', color: '#F0B429', marginBottom: '1.2rem', fontSize: '1.2rem' }}>
 {title}
 </h3>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
 {children}
 </div>
 </div>
 );

 const DataItem = ({ label, value }: { label: string, value: any }) => (
 <div>
 <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
 <span style={{ fontSize: '1rem', color: '#F1F5F9' }}>{value || '—'}</span>
 </div>
 );

 return (
 <div style={{ maxWidth: '900px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
 <h1 style={{ fontSize: '1.8rem', color: '#F1F5F9' }}>Revisión: {profile.user?.name}</h1>
 {profile.verificationStatus === 'PENDING' && v && (
 <div style={{ display: 'flex', gap: '1rem' }}>
 <button onClick={handleReject} className="btn" style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171' }} disabled={processing}>Rechazar</button>
 <button onClick={handleApprove} className="btn btn-success" disabled={processing}>Aprobar Abogado</button>
 </div>
 )}
 </div>

 {v ? (
 <div className="card shadow-sm" style={{ padding: '2rem' }}>
 <Section title="1️⃣ Información Profesional">
 <DataItem label="Nombre" value={profile.user?.name} />
 <DataItem label="Email" value={profile.user?.email} />
 <DataItem label="DNI" value={v.dni} />
 <DataItem label="Nro. Colegiatura" value={v.collegeId} />
 <DataItem label="Colegio de Abogados" value={v.collegeName} />
 <DataItem label="País / Ciudad" value={`${v.country}, ${v.city}`} />
 <DataItem label="Universidad" value={v.university} />
 <DataItem label="Año Grado" value={v.gradYear} />
 </Section>

 <Section title="2️⃣ Especialización y Estudios">
 <DataItem label="Especialidades" value={(v.specialties || []).join(', ')} />
 <DataItem label="Años Exp. Principal" value={v.mainExpYears} />
 <DataItem label="Postgrado" value={v.postgrad} />
 <DataItem label="Años Totales Ejercicio" value={v.totalYears} />
 </Section>

 <Section title="3️⃣ Experiencia y Casos">
 <DataItem label="Bufetes" value={v.firms} />
 <DataItem label="Empresas" value={v.companies} />
 <DataItem label="Casos últimos 3 años" value={v.casesLast3Years} />
 <div style={{ gridColumn: 'span 2' }}>
 <DataItem label="Caso Complejo Resuelto" value={<p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', marginTop: '0.5rem' }}>{v.complexCaseStory}</p>} />
 </div>
 </Section>

 <Section title="4️⃣ Evaluación Ética">
 <div style={{ gridColumn: 'span 2', display: 'grid', gap: '1.5rem' }}>
 <DataItem label="Manejo de conflictos de interés" value={v.conflictHandling} />
 <DataItem label="Respuesta ante dilema ético" value={v.ethicsResponse} />
 <DataItem label="Estructura de honorarios" value={v.feeStructure} />
 <DataItem label="Actualización jurídica" value={v.updateMethod} />
 </div>
 </Section>

 <Section title="5️⃣ Referencias y Validación">
 <DataItem label="LinkedIn" value={<a href={v.linkedin} target="_blank" style={{ color: 'var(--color-primary)' }}>{v.linkedin}</a>} />
 <DataItem label="Sitos Web" value={v.website} />
 <DataItem label="¿Sancionado?" value={v.hasSanctions ? 'SÍ' : 'NO'} />
 {v.hasSanctions && <DataItem label="Explicación Sanción" value={v.sanctionExpl} />}
 <div style={{ gridColumn: 'span 2' }}>
 <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Referencias</span>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
 {(v.references || []).map((ref: any, i: number) => (
 <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
 <strong>{ref.name}</strong> ({ref.role})<br />
 <span style={{ color: 'rgba(255,255,255,0.45)' }}>{ref.contact}</span>
 </div>
 ))}
 </div>
 </div>
 </Section>

 <Section title="6️⃣ Disponibilidad">
 <DataItem label="Modalidad" value={v.modality} />
 <DataItem label="Tiempo de respuesta" value={v.responseTime} />
 <DataItem label="¿Consulta gratuita?" value={v.firstConsultFree ? 'SÍ' : 'NO'} />
 <DataItem label="Idiomas" value={(v.languages || []).join(', ')} />
 <div style={{ gridColumn: 'span 2' }}>
 <DataItem label="Horarios" value={v.availability} />
 </div>
 </Section>
 </div>
 ) : (
 <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
 Este abogado no ha enviado su formulario de verificación aún.
 </div>
 )}

 <button onClick={() => router.back()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
 ← Volver
 </button>
 </div>
 );
}
