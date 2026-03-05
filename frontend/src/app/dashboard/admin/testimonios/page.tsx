'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminTestimoniosPage() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ clientName: '', clientRole: '', rating: 5, content: '', approved: false });

    const fetchTestimonials = async () => {
        try {
            const data = await apiFetch('/admin/testimonials');
            setTestimonials(data.testimonials);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchTestimonials(); }, []);

    const resetForm = () => {
        setForm({ clientName: '', clientRole: '', rating: 5, content: '', approved: false });
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await apiFetch(`/admin/testimonials/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
            } else {
                await apiFetch('/admin/testimonials', { method: 'POST', body: JSON.stringify(form) });
            }
            resetForm();
            fetchTestimonials();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    const startEdit = (t: any) => {
        setForm({ clientName: t.clientName, clientRole: t.clientRole || '', rating: t.rating, content: t.content, approved: t.approved });
        setEditId(t.id);
        setShowForm(true);
    };

    const approve = async (id: string) => {
        try {
            await apiFetch(`/admin/testimonials/${id}/approve`, { method: 'PUT' });
            fetchTestimonials();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    const deleteTestimonial = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este testimonio?')) return;
        try {
            await apiFetch(`/admin/testimonials/${id}`, { method: 'DELETE' });
            fetchTestimonials();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)' }}>Gestión de Testimonios</h1>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-primary">
                    {showForm ? 'Cancelar' : '+ Nuevo Testimonio'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{editId ? 'Editar' : 'Crear'} Testimonio</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group"><label className="form-label">Nombre del cliente</label><input className="form-input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">Rol/Profesión</label><input className="form-input" value={form.clientRole} onChange={(e) => setForm({ ...form, clientRole: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Rating (1-5)</label><input type="number" min={1} max={5} className="form-input" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Contenido</label><textarea className="form-input" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required style={{ resize: 'vertical' }} /></div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" id="approved" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })} />
                            <label htmlFor="approved" style={{ fontSize: '0.9rem' }}>Aprobado (visible en público)</label>
                        </div>
                        <button type="submit" className="btn btn-primary">{editId ? 'Actualizar' : 'Crear'}</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Cliente</th><th>Rol</th><th>Rating</th><th>Contenido</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {testimonials.map((t) => (
                            <tr key={t.id}>
                                <td style={{ fontWeight: 500 }}>{t.clientName}</td>
                                <td>{t.clientRole || '—'}</td>
                                <td><span className="stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span></td>
                                <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.content}</td>
                                <td>
                                    <span className={`badge ${t.approved ? 'badge-confirmada' : 'badge-pendiente'}`}>
                                        {t.approved ? 'Aprobado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                        {!t.approved && <button onClick={() => approve(t.id)} className="btn btn-success btn-sm">Aprobar</button>}
                                        <button onClick={() => startEdit(t)} className="btn btn-primary btn-sm">Editar</button>
                                        <button onClick={() => deleteTestimonial(t.id)} className="btn btn-danger btn-sm">Eliminar</button>
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
