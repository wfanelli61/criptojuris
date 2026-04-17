'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminServiciosPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '', active: true });

    const fetchServices = async () => {
        try {
            const data = await apiFetch('/admin/services');
            setServices(data.services);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchServices(); }, []);

    const resetForm = () => {
        setForm({ name: '', description: '', icon: '', active: true });
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await apiFetch(`/admin/services/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
            } else {
                await apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(form) });
            }
            resetForm();
            fetchServices();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    const startEdit = (s: any) => {
        setForm({ name: s.name, description: s.description || '', icon: s.icon || '', active: s.active });
        setEditId(s.id);
        setShowForm(true);
    };

    const toggleActive = async (id: string) => {
        try {
            await apiFetch(`/admin/services/${id}`, { method: 'DELETE' });
            fetchServices();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)' }}>Gestión de Servicios</h1>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-primary">
                    {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{editId ? 'Editar' : 'Crear'} Servicio</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group"><label className="form-label">Nombre</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">Ícono</label><input className="form-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="⚖️" /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
                        <button type="submit" className="btn btn-primary">{editId ? 'Actualizar' : 'Crear'}</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Ícono</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {services.map((s) => (
                            <tr key={s.id}>
                                <td style={{ fontSize: '1.5rem' }}>{s.icon}</td>
                                <td style={{ fontWeight: 500 }}>{s.name}</td>
                                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</td>
                                <td>
                                    <span className={`badge ${s.active ? 'badge-confirmada' : 'badge-cancelada'}`}>
                                        {s.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                        <button onClick={() => startEdit(s)} className="btn btn-primary btn-sm">Editar</button>
                                        {s.active && <button onClick={() => toggleActive(s.id)} className="btn btn-danger btn-sm">Desactivar</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
