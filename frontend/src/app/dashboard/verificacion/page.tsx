'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

const SPECIALTIES = [
    'Derecho Penal', 'Derecho Civil', 'Derecho Mercantil', 'Derecho Laboral',
    'Derecho de Familia', 'Derecho Tributario', 'Derecho Corporativo',
    'Derecho Administrativo', 'Criptoactivos / Blockchain',
];

const POSTGRADO_OPTIONS = ['No posee', 'Especialización', 'Maestría', 'Doctorado'];
const MODALITY_OPTIONS = ['Presencial', 'Online', 'Mixto'];

export default function VerificacionPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(true);

    const [form, setForm] = useState({
        // Step 1 - Datos Personales
        dni: '', collegeId: '', collegeName: '', country: '', city: '',
        gradYear: '', university: '', phone: '', email: '',
        // Step 2 - Especialización
        specialties: [] as string[], otherSpecialty: '', mainExpYears: '',
        postgrad: 'No posee',
        // Step 3 - Experiencia
        totalYears: '', firms: '', companies: '', casesLast3Years: '',
        complexCaseStory: '',
        // Step 4 - Evaluación
        conflictHandling: '', ethicsResponse: '', feeStructure: '', updateMethod: '',
        // Step 5 - Referencias
        linkedin: '', website: '',
        ref1Name: '', ref1Role: '', ref1Contact: '',
        ref2Name: '', ref2Role: '', ref2Contact: '',
        hasSanctions: false, sanctionExpl: '',
        // Step 6 - Disponibilidad
        modality: 'Mixto', responseTime: '', firstConsultFree: false,
        languages: ['Español'] as string[], otherLanguage: '', availability: '',
    });

    // Check if already submitted — if PENDING or APPROVED, redirect to dashboard
    useEffect(() => {
        apiFetch('/verification/me')
            .then(data => {
                if (data.verificationStatus === 'PENDING' || data.verificationStatus === 'APPROVED') {
                    router.push('/dashboard');
                } else {
                    setChecking(false);
                }
            })
            .catch(() => setChecking(false));
    }, [router]);

    if (checking) return <div className="spinner" />;

    const u = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    const toggleSpecialty = (s: string) => {
        setForm(prev => ({
            ...prev,
            specialties: prev.specialties.includes(s)
                ? prev.specialties.filter(x => x !== s)
                : [...prev.specialties, s],
        }));
    };

    const handleSubmit = async () => {
        setSending(true);
        setError('');
        try {
            const allSpecialties = [...form.specialties];
            if (form.otherSpecialty.trim()) allSpecialties.push(form.otherSpecialty.trim());

            const allLanguages = [...form.languages];
            if (form.otherLanguage.trim()) allLanguages.push(form.otherLanguage.trim());

            await apiFetch('/verification/submit', {
                method: 'POST',
                body: JSON.stringify({
                    dni: form.dni,
                    collegeId: form.collegeId,
                    collegeName: form.collegeName,
                    country: form.country,
                    city: form.city,
                    gradYear: parseInt(form.gradYear),
                    university: form.university,
                    phone: form.phone,
                    email: form.email,
                    specialties: allSpecialties,
                    mainExpYears: parseInt(form.mainExpYears || '0'),
                    postgrad: form.postgrad,
                    totalYears: parseInt(form.totalYears || '0'),
                    firms: form.firms,
                    companies: form.companies,
                    casesLast3Years: parseInt(form.casesLast3Years || '0'),
                    complexCaseStory: form.complexCaseStory,
                    conflictHandling: form.conflictHandling,
                    ethicsResponse: form.ethicsResponse,
                    feeStructure: form.feeStructure,
                    updateMethod: form.updateMethod,
                    linkedin: form.linkedin,
                    website: form.website,
                    references: [
                        { name: form.ref1Name, role: form.ref1Role, contact: form.ref1Contact },
                        { name: form.ref2Name, role: form.ref2Role, contact: form.ref2Contact },
                    ],
                    hasSanctions: form.hasSanctions,
                    sanctionExpl: form.sanctionExpl,
                    modality: form.modality,
                    responseTime: form.responseTime,
                    firstConsultFree: form.firstConsultFree,
                    languages: allLanguages,
                    availability: form.availability,
                }),
            });
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || 'Error al enviar solicitud');
        }
        setSending(false);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db',
        borderRadius: '8px', fontSize: '0.9rem', background: '#fff',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        color: '#374151', marginBottom: '0.3rem',
    };
    const gridStyle: React.CSSProperties = {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                📋 Formulario de Verificación
            </h1>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Completa este formulario para que un administrador pueda verificar tu perfil profesional.
            </p>

            {/* Progress */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map(s => (
                    <div key={s} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: s <= step ? 'var(--color-gold)' : '#e5e7eb',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>

            {error && (
                <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {error}
                </div>
            )}

            <div className="card" style={{ padding: '1.5rem' }}>

                {/* STEP 1 */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1F2937' }}>1️⃣ Datos Personales y Profesionales</h2>
                        <div style={gridStyle}>
                            <div>
                                <label style={labelStyle}>Cédula / DNI *</label>
                                <input style={inputStyle} value={form.dni} onChange={e => u('dni', e.target.value)} placeholder="V-12345678" />
                            </div>
                            <div>
                                <label style={labelStyle}>Nº Colegiatura / Inpreabogado *</label>
                                <input style={inputStyle} value={form.collegeId} onChange={e => u('collegeId', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={labelStyle}>Colegio de Abogados *</label>
                            <input style={inputStyle} value={form.collegeName} onChange={e => u('collegeName', e.target.value)} />
                        </div>
                        <div style={{ ...gridStyle, marginTop: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>País *</label>
                                <input style={inputStyle} value={form.country} onChange={e => u('country', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado / Ciudad *</label>
                                <input style={inputStyle} value={form.city} onChange={e => u('city', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ ...gridStyle, marginTop: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>Año de graduación *</label>
                                <input type="number" style={inputStyle} value={form.gradYear} onChange={e => u('gradYear', e.target.value)} placeholder="2015" />
                            </div>
                            <div>
                                <label style={labelStyle}>Universidad *</label>
                                <input style={inputStyle} value={form.university} onChange={e => u('university', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ ...gridStyle, marginTop: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>Teléfono profesional *</label>
                                <input style={inputStyle} value={form.phone} onChange={e => u('phone', e.target.value)} placeholder="+58 412 1234567" />
                            </div>
                            <div>
                                <label style={labelStyle}>Correo profesional *</label>
                                <input type="email" style={inputStyle} value={form.email} onChange={e => u('email', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1F2937' }}>2️⃣ Áreas de Especialización</h2>
                        <label style={labelStyle}>Seleccione sus áreas principales *</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {SPECIALTIES.map(s => (
                                <button key={s} type="button" onClick={() => toggleSpecialty(s)} style={{
                                    padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem',
                                    border: form.specialties.includes(s) ? '2px solid var(--color-gold)' : '1px solid #d1d5db',
                                    background: form.specialties.includes(s) ? 'rgba(212,168,71,0.15)' : '#fff',
                                    color: form.specialties.includes(s) ? '#92400E' : '#4B5563',
                                    cursor: 'pointer', fontWeight: form.specialties.includes(s) ? 600 : 400,
                                }}>
                                    {form.specialties.includes(s) ? '✓ ' : ''}{s}
                                </button>
                            ))}
                        </div>
                        <div style={gridStyle}>
                            <div>
                                <label style={labelStyle}>Otra especialidad</label>
                                <input style={inputStyle} value={form.otherSpecialty} onChange={e => u('otherSpecialty', e.target.value)} placeholder="Especificar..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Años en su área principal *</label>
                                <input type="number" style={inputStyle} value={form.mainExpYears} onChange={e => u('mainExpYears', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={labelStyle}>¿Posee estudios de postgrado? *</label>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {POSTGRADO_OPTIONS.map(o => (
                                    <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                        <input type="radio" name="postgrad" checked={form.postgrad === o} onChange={() => u('postgrad', o)} />
                                        {o}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1F2937' }}>3️⃣ Experiencia Profesional</h2>
                        <div style={gridStyle}>
                            <div>
                                <label style={labelStyle}>Años totales de experiencia *</label>
                                <input type="number" style={inputStyle} value={form.totalYears} onChange={e => u('totalYears', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Casos atendidos (últimos 3 años) *</label>
                                <input type="number" style={inputStyle} value={form.casesLast3Years} onChange={e => u('casesLast3Years', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ ...gridStyle, marginTop: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>Bufetes donde ha trabajado</label>
                                <input style={inputStyle} value={form.firms} onChange={e => u('firms', e.target.value)} placeholder="Separe con comas" />
                            </div>
                            <div>
                                <label style={labelStyle}>Empresas asesoradas</label>
                                <input style={inputStyle} value={form.companies} onChange={e => u('companies', e.target.value)} placeholder="Separe con comas" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={labelStyle}>Describa un caso complejo que haya llevado *</label>
                            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} value={form.complexCaseStory}
                                onChange={e => u('complexCaseStory', e.target.value)}
                                placeholder="Describa brevemente un caso relevante y su resultado..." />
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1F2937' }}>4️⃣ Evaluación Ética y Profesional</h2>
                        {[
                            { key: 'conflictHandling', label: '¿Cómo maneja un conflicto de interés con un cliente?' },
                            { key: 'ethicsResponse', label: '¿Qué haría si un cliente le pide algo que va en contra de la ley o la ética?' },
                            { key: 'feeStructure', label: '¿Cómo estructura sus honorarios?' },
                            { key: 'updateMethod', label: '¿Cómo mantiene informados a sus clientes sobre el avance de su caso?' },
                        ].map(q => (
                            <div key={q.key} style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>{q.label} *</label>
                                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2}
                                    value={(form as any)[q.key]}
                                    onChange={e => u(q.key, e.target.value)} />
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1F2937' }}>5️⃣ Referencias y Portafolio</h2>
                        <div style={gridStyle}>
                            <div>
                                <label style={labelStyle}>LinkedIn</label>
                                <input style={inputStyle} value={form.linkedin} onChange={e => u('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Página web</label>
                                <input style={inputStyle} value={form.website} onChange={e => u('website', e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                        <p style={{ ...labelStyle, marginTop: '1rem', marginBottom: '0.5rem' }}>Referencia profesional 1 *</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <input style={inputStyle} placeholder="Nombre" value={form.ref1Name} onChange={e => u('ref1Name', e.target.value)} />
                            <input style={inputStyle} placeholder="Cargo" value={form.ref1Role} onChange={e => u('ref1Role', e.target.value)} />
                            <input style={inputStyle} placeholder="Contacto" value={form.ref1Contact} onChange={e => u('ref1Contact', e.target.value)} />
                        </div>
                        <p style={{ ...labelStyle, marginTop: '0.75rem', marginBottom: '0.5rem' }}>Referencia profesional 2 *</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <input style={inputStyle} placeholder="Nombre" value={form.ref2Name} onChange={e => u('ref2Name', e.target.value)} />
                            <input style={inputStyle} placeholder="Cargo" value={form.ref2Role} onChange={e => u('ref2Role', e.target.value)} />
                            <input style={inputStyle} placeholder="Contacto" value={form.ref2Contact} onChange={e => u('ref2Contact', e.target.value)} />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <input type="checkbox" checked={form.hasSanctions} onChange={e => u('hasSanctions', e.target.checked)} />
                                ¿Ha tenido sanciones disciplinarias?
                            </label>
                            {form.hasSanctions && (
                                <textarea style={{ ...inputStyle, marginTop: '0.5rem', resize: 'vertical' }} rows={2}
                                    placeholder="Explique brevemente..."
                                    value={form.sanctionExpl} onChange={e => u('sanctionExpl', e.target.value)} />
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 6 */}
                {step === 6 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1F2937' }}>6️⃣ Disponibilidad y Modalidad</h2>
                        <div style={gridStyle}>
                            <div>
                                <label style={labelStyle}>Modalidad de atención *</label>
                                <select style={inputStyle} value={form.modality} onChange={e => u('modality', e.target.value)}>
                                    {MODALITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Tiempo de respuesta *</label>
                                <select style={inputStyle} value={form.responseTime} onChange={e => u('responseTime', e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    <option value="Menos de 1 hora">Menos de 1 hora</option>
                                    <option value="1-4 horas">1-4 horas</option>
                                    <option value="Mismo día">Mismo día</option>
                                    <option value="24-48 horas">24-48 horas</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={labelStyle}>Horario de disponibilidad *</label>
                            <input style={inputStyle} value={form.availability} onChange={e => u('availability', e.target.value)} placeholder="Ej: Lun-Vie 8am-5pm" />
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={labelStyle}>Idiomas</label>
                            <input style={inputStyle} value={form.otherLanguage} onChange={e => u('otherLanguage', e.target.value)} placeholder="Idiomas adicionales (separar con comas)" />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                            <input type="checkbox" checked={form.firstConsultFree} onChange={e => u('firstConsultFree', e.target.checked)} />
                            ¿Ofrece primera consulta gratuita?
                        </label>
                    </div>
                )}

                {/* Navigation buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)}
                            style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
                            ← Anterior
                        </button>
                    ) : <div />}

                    {step < 6 ? (
                        <button type="button" onClick={() => setStep(step + 1)}
                            className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                            Siguiente →
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={sending}
                            className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                            {sending ? 'Enviando...' : '✅ Enviar Solicitud'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
