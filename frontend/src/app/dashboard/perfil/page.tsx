'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientProfilePage() {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await apiFetch('/clients/me', {
                method: 'PUT',
                body: JSON.stringify({ name, phone }),
            });
            await refreshUser();
            setMessage('Perfil actualizado exitosamente');
        } catch (err: any) {
            setMessage(err.message || 'Error al actualizar');
        }
        setSaving(false);
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>Mi Perfil</h1>

            <div className="card" style={{ maxWidth: '500px' }}>
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
                        <label className="form-label" htmlFor="name">Nombre</label>
                        <input id="name" type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input id="email" type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Teléfono</label>
                        <input id="phone" type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
