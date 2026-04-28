'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const ESTADOS_VE = [
    'Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar','Carabobo',
    'Cojedes','Delta Amacuro','Distrito Capital','Falcón','Guárico','Lara',
    'Mérida','Miranda','Monagas','Nueva Esparta','Portuguesa','Sucre','Táchira',
    'Trujillo','Vargas','Yaracuy','Zulia',
];

export default function ClientProfilePage() {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState({
        name: '', phone: '', cedula: '', rif: '', estado: '', direccion: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!user) return;
        apiFetch('/clients/me').then(d => {
            const u = d.user || user;
            setForm({
                name:     u.name     || '',
                phone:    u.phone    || '',
                cedula:   u.cedula   || '',
                rif:      u.rif      || '',
                estado:   u.estado   || '',
                direccion:u.direccion|| '',
            });
        }).catch(() => {
            setForm({ name: user.name || '', phone: user.phone || '', cedula: '', rif: '', estado: '', direccion: '' });
        });
    }, [user]);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await apiFetch('/clients/me', { method: 'PUT', body: JSON.stringify(form) });
            await refreshUser();
            setIsError(false);
            setMessage('Perfil actualizado correctamente.');
        } catch (err: any) {
            setIsError(true);
            setMessage(err.message || 'Error al guardar.');
        }
        setSaving(false);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.6rem 0.85rem',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '0.6rem', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none',
        boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.75rem', fontWeight: 600,
        color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em',
    };

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)', margin: 0 }}>Mi Perfil</h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    Tu información personal guardada en el sistema
                </p>
            </div>

            {message && (
                <div style={{
                    padding: '0.8rem 1rem', borderRadius: '0.6rem', marginBottom: '1.5rem', fontSize: '0.85rem',
                    background: isError ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
                    border: `1px solid ${isError ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)'}`,
                    color: isError ? '#F87171' : '#34D399',
                }}>{message}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Datos personales */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                        Datos personales
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Nombre completo</label>
                            <input style={inputStyle} value={form.name} onChange={set('name')} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Cédula de Identidad</label>
                            <input style={inputStyle} placeholder="V-12.345.678" value={form.cedula} onChange={set('cedula')} />
                        </div>
                        <div>
                            <label style={labelStyle}>RIF (si aplica)</label>
                            <input style={inputStyle} placeholder="J-12345678-9" value={form.rif} onChange={set('rif')} />
                        </div>
                        <div>
                            <label style={labelStyle}>Teléfono</label>
                            <input style={inputStyle} placeholder="+58 412 000 0000" value={form.phone} onChange={set('phone')} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={user?.email || ''} disabled />
                        </div>
                    </div>
                </div>

                {/* Ubicación */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0B429', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                        Ubicación
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Estado</label>
                            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.estado} onChange={set('estado')}>
                                <option value="">Seleccionar estado...</option>
                                {ESTADOS_VE.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Dirección</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="Urbanización, calle, número de casa o apartamento..."
                                value={form.direccion}
                                onChange={set('direccion') as any}
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={saving} style={{
                    padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                    color: '#0C2340', borderRadius: '0.6rem', border: 'none', fontWeight: 700,
                    fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, alignSelf: 'flex-start',
                }}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </form>
        </div>
    );
}
