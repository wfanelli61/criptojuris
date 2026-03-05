'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        apiFetch(`/admin/applications/${id}`)
            .then(data => setApp(data.application))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    const handleApprove = async () => {
        if (!confirm('¿Está seguro de aprobar a este abogado? Será visible en la página pública.')) return;
        setProcessing(true);
        try {
            await apiFetch(`/admin/applications/${id}/approve`, { method: 'PUT' });
            alert('Abogado aprobado exitosamente');
            router.push('/dashboard/admin/aplicaciones');
        } catch (err: any) {
            alert(err.message || 'Error al aprobar');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Indique el motivo del rechazo (opcional):');
        if (reason === null) return;
        setProcessing(true);
        try {
            await apiFetch(`/admin/applications/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) });
            alert('Solicitud rechazada');
            router.push('/dashboard/admin/aplicaciones');
        } catch (err: any) {
            alert(err.message || 'Error al rechazar');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="spinner" />;
    if (!app) return <div>No se encontró la solicitud.</div>;

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.4rem', color: 'var(--color-primary)', marginBottom: '1.2rem', fontSize: '1.2rem' }}>
                {title}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {children}
            </div>
        </div>
    );

    const DataItem = ({ label, value }: { label: string, value: any }) => (
        <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: '1rem', color: '#111' }}>{value || '—'}</span>
        </div>
    );

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)' }}>Revisión de Solicitud: {app.user?.name}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleReject} className="btn" style={{ background: '#FEE2E2', color: '#991B1B' }} disabled={processing}>Rechazar</button>
                    <button onClick={handleApprove} className="btn btn-success" disabled={processing}>Aprobar Abogado</button>
                </div>
            </div>

            <div className="card shadow-sm" style={{ padding: '2rem' }}>
                <Section title="1️⃣ Información Profesional">
                    <DataItem label="Nombre" value={app.user?.name} />
                    <DataItem label="Email" value={app.user?.email} />
                    <DataItem label="DNI" value={app.dni} />
                    <DataItem label="Nro. Colegiatura" value={app.collegeId} />
                    <DataItem label="Colegio de Abogados" value={app.collegeName} />
                    <DataItem label="País / Ciudad" value={`${app.country}, ${app.city}`} />
                    <DataItem label="Universidad" value={app.university} />
                    <DataItem label="Año Grado" value={app.gradYear} />
                </Section>

                <Section title="2️⃣ Especialización y Estudios">
                    <DataItem label="Especialidades" value={(app.specialties || []).join(', ')} />
                    <DataItem label="Años Exp. Principal" value={app.mainExpYears} />
                    <DataItem label="Postgrado" value={app.postgrad} />
                    <DataItem label="Años Totales Ejercicio" value={app.totalYears} />
                </Section>

                <Section title="3️⃣ Experiencia y Casos">
                    <DataItem label="Bufetes" value={app.firms} />
                    <DataItem label="Empresas" value={app.companies} />
                    <DataItem label="Casos últimos 3 años" value={app.casesLast3Years} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <DataItem label="Caso Complejo Resuelto" value={<p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', marginTop: '0.5rem' }}>{app.complexCaseStory}</p>} />
                    </div>
                </Section>

                <Section title="4️⃣ Evaluación Ética">
                    <div style={{ gridColumn: 'span 2', display: 'grid', gap: '1.5rem' }}>
                        <DataItem label="Manejo de conflictos de interés" value={app.conflictHandling} />
                        <DataItem label="Respuesta ante dilema ético" value={app.ethicsResponse} />
                        <DataItem label="Estructura de honorarios" value={app.feeStructure} />
                        <DataItem label="Actualización jurídica" value={app.updateMethod} />
                    </div>
                </Section>

                <Section title="5️⃣ Referencias y Validación">
                    <DataItem label="LinkedIn" value={<a href={app.linkedin} target="_blank" style={{ color: 'var(--color-primary)' }}>{app.linkedin}</a>} />
                    <DataItem label="Sitos Web" value={app.website} />
                    <DataItem label="¿Sancionado?" value={app.hasSanctions ? 'SÍ' : 'NO'} />
                    {app.hasSanctions && <DataItem label="Explicación Sanción" value={app.sanctionExpl} />}
                    <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Referencias</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {(app.references || []).map((ref: any, i: number) => (
                                <div key={i} style={{ padding: '1rem', background: '#F9FAFB', borderRadius: 'var(--radius-sm)' }}>
                                    <strong>{ref.name}</strong> ({ref.role})<br />
                                    <span style={{ color: '#666' }}>{ref.contact}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="6️⃣ Disponibilidad">
                    <DataItem label="Modalidad" value={app.modality} />
                    <DataItem label="Tiempo de respuesta" value={app.responseTime} />
                    <DataItem label="¿Consulta gratuita?" value={app.firstConsultFree ? 'SÍ' : 'NO'} />
                    <DataItem label="Idiomas" value={(app.languages || []).join(', ')} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <DataItem label="Horarios" value={app.availability} />
                    </div>
                </Section>
            </div>
        </div>
    );
}
