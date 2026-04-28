'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ClockIcon, XIcon, CheckIcon, UserIcon } from '@/components/Icons';

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
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
 <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0B429' }}>
 <UserIcon size={20} />
 </div>
 <div>
 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Cuenta</p>
 <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Mi Perfil Profesional</h1>
 </div>
 </div>

 {/* Verification status banners */}
 {verificationStatus === 'PENDING' && (
 <div style={{
 padding: '1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
 borderRadius: '0.75rem', color: '#FBBF24', marginBottom: '1.5rem',
 display: 'flex', alignItems: 'center', gap: '0.75rem',
 }}>
 <ClockIcon size={18} stroke="#FBBF24" />
 <div>
 <strong style={{ display: 'block' }}>Verificación en proceso</strong>
 <p style={{ fontSize: '0.85rem', marginTop: '0.2rem', color: 'rgba(255,255,255,0.6)' }}>
 Tu solicitud está siendo revisada por un administrador. Te notificaremos cuando sea aprobada.
 </p>
 </div>
 </div>
 )}

 {verificationStatus === 'APPROVED' && (
 <div style={{
 padding: '0.75rem 1rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
 borderRadius: '0.75rem', color: '#34D399', marginBottom: '1.5rem',
 display: 'flex', alignItems: 'center', gap: '0.6rem',
 fontSize: '0.85rem', fontWeight: 600,
 }}>
 <CheckIcon size={15} stroke="#34D399" /> Perfil verificado y visible en la landing page
 </div>
 )}

 {verificationStatus === 'REJECTED' && (
 <div style={{
 padding: '1rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
 borderRadius: '0.75rem', color: '#F87171', marginBottom: '1.5rem',
 display: 'flex', alignItems: 'center', gap: '0.75rem',
 }}>
 <XIcon size={18} stroke="#F87171" />
 <div>
 <strong style={{ display: 'block' }}>Verificación rechazada</strong>
 <p style={{ fontSize: '0.85rem', marginTop: '0.2rem', color: 'rgba(255,255,255,0.55)' }}>
 Tu solicitud fue rechazada. Puedes{' '}
 <a href="/dashboard/verificacion" style={{ color: '#F87171', fontWeight: 600 }}>enviar una nueva solicitud</a>.
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

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
 <div className="form-group">
 <label className="form-label" htmlFor="city">Ciudad</label>
 <input id="city" className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="languages">Idiomas (separados por coma)</label>
 <input id="languages" className="form-input" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
 </div>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
