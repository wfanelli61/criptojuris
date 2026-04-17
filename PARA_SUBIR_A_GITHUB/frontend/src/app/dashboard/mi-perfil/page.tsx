'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function LawyerProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState('NONE');
    const [form, setForm] = useState({
        bio: '', specialties: '', city: '', languages: '',
        ratePerHour: '', yearsExperience: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        Promise.all([
            apiFetch('/lawyers/me/profile'),
            apiFetch('/verification/me'),
        ]).then(([profileData, verData]) => {
            setProfile(profileData.lawyer);
            setVerificationStatus(verData.verificationStatus || 'NONE');
            const p = profileData.lawyer?.lawyerProfile;
            if (p) {
                setForm({
                    bio: p.bio || '',
                    specialties: (p.specialties || []).join(', '),
                    city: p.city || '',
                    languages: (p.languages || []).join(', '),
                    ratePerHour: p.ratePerHour?.toString() || '',
                    yearsExperience: p.yearsExperience?.toString() || '',
                });
            }
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await apiFetch('/lawyers/me/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    bio: form.bio,
                    specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
                    city: form.city,
                    languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
                    ratePerHour: form.ratePerHour ? parseFloat(form.ratePerHour) : undefined,
                    yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
                }),
            });
            setMessage('Perfil actualizado exitosamente');
        } catch (err: any) {
            setMessage(err.message || 'Error al actualizar');
        }
        setSaving(false);
    };

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Mi Perfil Profesional</h1>

            {/* Verification status banners */}
            {verificationStatus === 'PENDING' && (
                <div style={{
                    padding: '1rem', background: '#FEF3C7', border: '1px solid #FDE68A',
                    borderRadius: 'var(--radius-md)', color: '#92400E', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>⏳</span>
                    <div>
                        <strong style={{ display: 'block' }}>Verificación en proceso</strong>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                            Tu solicitud está siendo revisada por un administrador. Te notificaremos cuando sea aprobada.
                        </p>
                    </div>
                </div>
            )}

            {verificationStatus === 'APPROVED' && (
                <div style={{
                    padding: '0.75rem 1rem', background: '#D1FAE5', border: '1px solid #A7F3D0',
                    borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: '0.85rem', fontWeight: 600
                }}>
                    ✅ Perfil verificado y visible en la landing page
                </div>
            )}

            {verificationStatus === 'REJECTED' && (
                <div style={{
                    padding: '1rem', background: '#FEE2E2', border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-md)', color: '#991B1B', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>❌</span>
                    <div>
                        <strong style={{ display: 'block' }}>Verificación rechazada</strong>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                            Tu solicitud fue rechazada. Puedes{' '}
                            <a href="/dashboard/verificacion" style={{ color: '#991B1B', fontWeight: 600 }}>enviar una nueva solicitud</a>.
                        </p>
                    </div>
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                {message && (
                    <div style={{
                        padding: '0.75rem',
                        background: message.includes('Error') ? '#FEE2E2' : '#D1FAE5',
                        borderRadius: 'var(--radius-md)',
                        color: message.includes('Error') ? '#991B1B' : '#065F46',
                        fontSize: '0.85rem', marginBottom: '1rem',
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="bio">Biografía profesional</label>
                        <textarea id="bio" className="form-input" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Describa su experiencia y formación..." style={{ resize: 'vertical' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="specialties">Especialidades (separadas por coma)</label>
                        <input id="specialties" className="form-input" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="Derecho Civil, Derecho Penal, etc." />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="city">Ciudad</label>
                            <input id="city" className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="languages">Idiomas (separados por coma)</label>
                            <input id="languages" className="form-input" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="rate">Tarifa por hora ($)</label>
                            <input id="rate" type="number" className="form-input" value={form.ratePerHour} onChange={(e) => setForm({ ...form, ratePerHour: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="experience">Años de experiencia</label>
                            <input id="experience" type="number" className="form-input" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
