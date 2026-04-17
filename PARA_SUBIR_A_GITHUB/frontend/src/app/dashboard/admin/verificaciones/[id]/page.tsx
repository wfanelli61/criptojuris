'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function AdminVerificacionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    useEffect(() => {
        apiFetch(`/admin/verifications/${id}`)
            .then(data => setProfile(data.profile))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    const handleAction = async (action: 'approve' | 'reject') => {
        setActing(true);
        try {
            await apiFetch(`/admin/verifications/${id}/${action}`, { method: 'PUT' });
            router.push('/dashboard/admin/verificaciones');
        } catch { }
        setActing(false);
    };

    if (loading) return <div className="spinner" />;
    if (!profile) return <p>No se encontró el perfil.</p>;

    const v = profile.verification;
    const sectionStyle: React.CSSProperties = { marginBottom: '1.5rem' };
    const sectionTitleStyle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem' };
    const fieldStyle: React.CSSProperties = { marginBottom: '0.5rem', fontSize: '0.85rem' };
    const labelStyle: React.CSSProperties = { fontWeight: 600, color: '#374151', marginRight: '0.3rem' };
    const valueStyle: React.CSSProperties = { color: '#4B5563' };

    const statusColors: any = {
        PENDING: { bg: '#FEF3C7', color: '#92400E', label: '⏳ Pendiente' },
        APPROVED: { bg: '#D1FAE5', color: '#065F46', label: '✅ Aprobado' },
        REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: '❌ Rechazado' },
    };
    const sc = statusColors[profile.verificationStatus] || statusColors.PENDING;

    return (
        <div style={{ maxWidth: '800px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>{profile.user?.name}</h1>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>{profile.user?.email}</p>
                </div>
                <span style={{ padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                    {sc.label}
                </span>
            </div>

            {v ? (
                <div className="card" style={{ padding: '1.5rem' }}>
                    {/* Section 1 */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>1️⃣ Datos Personales</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
                            <p style={fieldStyle}><span style={labelStyle}>DNI:</span><span style={valueStyle}>{v.dni}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Colegiatura:</span><span style={valueStyle}>{v.collegeId}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Colegio:</span><span style={valueStyle}>{v.collegeName}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>País:</span><span style={valueStyle}>{v.country}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Ciudad:</span><span style={valueStyle}>{v.city}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Año graduación:</span><span style={valueStyle}>{v.gradYear}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Universidad:</span><span style={valueStyle}>{v.university}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Teléfono:</span><span style={valueStyle}>{v.phone}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Email:</span><span style={valueStyle}>{v.email}</span></p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>2️⃣ Especialización</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                            {(v.specialties || []).map((s: string) => (
                                <span key={s} style={{ padding: '0.2rem 0.6rem', background: 'rgba(212,168,71,0.15)', color: '#92400E', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
                            ))}
                        </div>
                        <p style={fieldStyle}><span style={labelStyle}>Años área principal:</span><span style={valueStyle}>{v.mainExpYears}</span></p>
                        <p style={fieldStyle}><span style={labelStyle}>Postgrado:</span><span style={valueStyle}>{v.postgrad}</span></p>
                    </div>

                    {/* Section 3 */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>3️⃣ Experiencia Profesional</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
                            <p style={fieldStyle}><span style={labelStyle}>Años totales:</span><span style={valueStyle}>{v.totalYears}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Casos (3 años):</span><span style={valueStyle}>{v.casesLast3Years}</span></p>
                            {v.firms && <p style={fieldStyle}><span style={labelStyle}>Bufetes:</span><span style={valueStyle}>{v.firms}</span></p>}
                            {v.companies && <p style={fieldStyle}><span style={labelStyle}>Empresas:</span><span style={valueStyle}>{v.companies}</span></p>}
                        </div>
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                            <p style={{ ...labelStyle, display: 'block', marginBottom: '0.3rem' }}>Caso complejo:</p>
                            <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>{v.complexCaseStory}</p>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>4️⃣ Evaluación Ética</h3>
                        {[
                            { label: 'Conflicto de interés', value: v.conflictHandling },
                            { label: 'Ética ante solicitud ilegal', value: v.ethicsResponse },
                            { label: 'Estructura de honorarios', value: v.feeStructure },
                            { label: 'Actualización al cliente', value: v.updateMethod },
                        ].map(q => (
                            <div key={q.label} style={{ marginBottom: '0.75rem', padding: '0.6rem', background: '#F9FAFB', borderRadius: '6px' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.2rem' }}>{q.label}</p>
                                <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>{q.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Section 5 */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>5️⃣ Referencias</h3>
                        {v.linkedin && <p style={fieldStyle}><span style={labelStyle}>LinkedIn:</span><a href={v.linkedin} target="_blank" style={{ color: '#2563EB' }}>{v.linkedin}</a></p>}
                        {v.website && <p style={fieldStyle}><span style={labelStyle}>Web:</span><a href={v.website} target="_blank" style={{ color: '#2563EB' }}>{v.website}</a></p>}
                        <div style={{ marginTop: '0.5rem' }}>
                            {(v.references || []).map((r: any, i: number) => (
                                <div key={i} style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                    <strong>{r.name}</strong> — {r.role} — {r.contact}
                                </div>
                            ))}
                        </div>
                        <p style={{ ...fieldStyle, marginTop: '0.5rem' }}>
                            <span style={labelStyle}>Sanciones:</span>
                            <span style={valueStyle}>{v.hasSanctions ? `Sí: ${v.sanctionExpl}` : 'No'}</span>
                        </p>
                    </div>

                    {/* Section 6 */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>6️⃣ Disponibilidad</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
                            <p style={fieldStyle}><span style={labelStyle}>Modalidad:</span><span style={valueStyle}>{v.modality}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Respuesta:</span><span style={valueStyle}>{v.responseTime}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Horario:</span><span style={valueStyle}>{v.availability}</span></p>
                            <p style={fieldStyle}><span style={labelStyle}>Consulta gratis:</span><span style={valueStyle}>{v.firstConsultFree ? 'Sí' : 'No'}</span></p>
                        </div>
                        {v.languages?.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem' }}>
                                <span style={labelStyle}>Idiomas:</span>
                                {v.languages.map((l: string) => (
                                    <span key={l} style={{ padding: '0.15rem 0.5rem', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '10px', fontSize: '0.75rem' }}>{l}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                    Este abogado no ha enviado su formulario de verificación aún.
                </div>
            )}

            {/* Action buttons */}
            {profile.verificationStatus === 'PENDING' && v && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction('reject')} disabled={acting}
                        style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: '1px solid #DC2626', background: '#fff', color: '#DC2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                        ❌ Rechazar
                    </button>
                    <button onClick={() => handleAction('approve')} disabled={acting}
                        className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                        ✅ Aprobar Abogado
                    </button>
                </div>
            )}

            <button onClick={() => router.back()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                ← Volver a solicitudes
            </button>
        </div>
    );
}
