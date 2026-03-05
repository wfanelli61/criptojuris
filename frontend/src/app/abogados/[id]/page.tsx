'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LawyerDetail {
    id: string;
    name: string;
    email: string;
    phone?: string;
    lawyerProfile?: {
        bio: string;
        specialties: string[];
        city: string;
        languages: string[];
        ratePerHour: number;
        yearsExperience: number;
    };
}

interface Service {
    id: string;
    name: string;
}

export default function LawyerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [lawyer, setLawyer] = useState<LawyerDetail | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ serviceId: '', message: '', preferredDate: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            apiFetch(`/public/lawyers/${params.id}`),
            apiFetch('/public/services'),
        ]).then(([l, s]) => {
            setLawyer(l.lawyer);
            setServices(s.services);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push('/login');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await apiFetch('/clients/me/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    lawyerId: params.id as string,
                    serviceId: formData.serviceId,
                    message: formData.message,
                    preferredDate: formData.preferredDate || undefined,
                }),
            });
            setSuccess('¡Solicitud enviada exitosamente! Te contactaremos pronto.');
            setShowForm(false);
        } catch (err: any) {
            setError(err.message || 'Error al enviar la solicitud');
        }
        setSubmitting(false);
    };

    const handleChatClick = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setSubmitting(true);
        try {
            const data = await apiFetch('/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({ targetUserId: params.id }),
            });
            router.push('/dashboard/chat');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar el chat');
        }
        setSubmitting(false);
    };

    if (loading) return <div style={{ padding: '4rem' }}><div className="spinner" /></div>;
    if (!lawyer) return <div style={{ padding: '4rem', textAlign: 'center' }}>Abogado no encontrado</div>;

    const profile = lawyer.lawyerProfile;

    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <Link href="/abogados" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    ← Volver a abogados
                </Link>

                <div className="card" style={{ padding: '2.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '120px', height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-white)',
                            fontSize: '3rem',
                            fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {lawyer.name.charAt(0)}
                        </div>

                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                                {lawyer.name}
                            </h1>

                            {profile && (
                                <>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                        <span>📍 {profile.city}</span>
                                        <span>⏱️ {profile.yearsExperience} años de experiencia</span>
                                        {profile.ratePerHour && <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>💰 ${profile.ratePerHour}/hora</span>}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                        {profile.specialties.map((s) => (
                                            <span key={s} style={{
                                                background: 'var(--color-primary-50)',
                                                color: 'var(--color-primary)',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                            }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    {profile.languages.length > 0 && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                                            🌐 Idiomas: {profile.languages.join(', ')}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {profile?.bio && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Acerca de</h3>
                            <p style={{ color: 'var(--color-text-light)', lineHeight: 1.8, fontSize: '0.95rem' }}>{profile.bio}</p>
                        </div>
                    )}

                    {/* CTA */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {!showForm && !success && (
                            <>
                                {(!user || user.role === 'CLIENTE') ? (
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => user ? setShowForm(true) : router.push('/login')} className="btn btn-primary btn-lg">
                                            Solicitar Consulta
                                        </button>
                                        <button onClick={handleChatClick} className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            💬 Chatear ahora
                                        </button>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: 0 }}>
                                        <em>Inicia sesión como cliente para solicitar información.</em>
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {success && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#D1FAE5', borderRadius: 'var(--radius-md)', color: '#065F46', fontWeight: 500 }}>
                            ✅ {success}
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEE2E2', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
                            {error}
                        </div>
                    )}

                    {/* Appointment Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} style={{
                            marginTop: '2rem',
                            padding: '2rem',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                        }}>
                            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Solicitar Consulta</h3>

                            <div className="form-group">
                                <label className="form-label" htmlFor="serviceId">Servicio *</label>
                                <select
                                    id="serviceId"
                                    className="form-input"
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccione un servicio</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="preferredDate">Fecha y hora preferida</label>
                                <input
                                    type="datetime-local"
                                    id="preferredDate"
                                    className="form-input"
                                    value={formData.preferredDate}
                                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="message">Mensaje / Descripción del caso</label>
                                <textarea
                                    id="message"
                                    className="form-input"
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describa brevemente su situación legal..."
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
