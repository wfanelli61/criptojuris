'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminAbogadosPage() {
    const [lawyers, setLawyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ bio: '', specialties: '', city: '', languages: '', ratePerHour: '', yearsExperience: '' });

    const fetchLawyers = async () => {
        try {
            const data = await apiFetch('/admin/lawyers?limit=50');
            setLawyers(data.lawyers);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchLawyers(); }, []);

    const startEdit = (lawyer: any) => {
        const p = lawyer.lawyerProfile || {};
        setEditing(lawyer.id);
        setEditForm({
            bio: p.bio || '', specialties: (p.specialties || []).join(', '),
            city: p.city || '', languages: (p.languages || []).join(', '),
            ratePerHour: p.ratePerHour?.toString() || '', yearsExperience: p.yearsExperience?.toString() || '',
        });
    };

    const saveEdit = async () => {
        if (!editing) return;
        try {
            await apiFetch(`/admin/lawyers/${editing}`, {
                method: 'PUT',
                body: JSON.stringify({
                    bio: editForm.bio,
                    specialties: editForm.specialties.split(',').map((s) => s.trim()).filter(Boolean),
                    city: editForm.city,
                    languages: editForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
                    ratePerHour: editForm.ratePerHour ? parseFloat(editForm.ratePerHour) : undefined,
                    yearsExperience: editForm.yearsExperience ? parseInt(editForm.yearsExperience) : undefined,
                }),
            });
            setEditing(null);
            fetchLawyers();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    const toggleApproval = async (id: string, approve: boolean) => {
        try {
            await apiFetch(`/admin/lawyers/${id}/${approve ? 'approve' : 'reject'}`, { method: 'PUT' });
            fetchLawyers();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>Gestión de Abogados</h1>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Nombre</th><th>Email</th><th>Estado</th><th>Ciudad</th><th>Especialidades</th><th>Tarifa</th><th>Exp.</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {lawyers.map((l) => {
                            const p = l.lawyerProfile || {};
                            if (editing === l.id) {
                                return (
                                    <tr key={l.id}>
                                        <td>{l.name}</td>
                                        <td>{l.email}</td>
                                        <td>{p.verificationStatus === 'APPROVED' ? '✅ Aprobado' : '⏳ Pendiente'}</td>
                                        <td><input className="form-input" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={{ padding: '0.3rem', fontSize: '0.85rem', width: '100px' }} /></td>
                                        <td><input className="form-input" value={editForm.specialties} onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })} style={{ padding: '0.3rem', fontSize: '0.85rem', width: '180px' }} /></td>
                                        <td><input type="number" className="form-input" value={editForm.ratePerHour} onChange={(e) => setEditForm({ ...editForm, ratePerHour: e.target.value })} style={{ padding: '0.3rem', fontSize: '0.85rem', width: '80px' }} /></td>
                                        <td><input type="number" className="form-input" value={editForm.yearsExperience} onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })} style={{ padding: '0.3rem', fontSize: '0.85rem', width: '60px' }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                <button onClick={saveEdit} className="btn btn-success btn-sm">Guardar</button>
                                                <button onClick={() => setEditing(null)} className="btn btn-sm" style={{ background: 'var(--color-border)' }}>Cancelar</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                            return (
                                <tr key={l.id}>
                                    <td style={{ fontWeight: 500 }}>{l.name}</td>
                                    <td>{l.email}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: p.verificationStatus === 'APPROVED' ? '#D1FAE5' : '#FEF3C7',
                                            color: p.verificationStatus === 'APPROVED' ? '#065F46' : '#92400E',
                                        }}>
                                            {p.verificationStatus === 'APPROVED' ? 'Aprobado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td>{p.city || '—'}</td>
                                    <td>{(p.specialties || []).join(', ') || '—'}</td>
                                    <td>{p.ratePerHour ? `$${p.ratePerHour}` : '—'}</td>
                                    <td>{p.yearsExperience || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button onClick={() => startEdit(l)} className="btn btn-primary btn-sm">Editar</button>
                                            {p.verificationStatus === 'APPROVED' ? (
                                                <button onClick={() => toggleApproval(l.id, false)} className="btn btn-sm" style={{ background: '#FEE2E2', color: '#B91C1C' }}>Rechazar</button>
                                            ) : (
                                                <button onClick={() => toggleApproval(l.id, true)} className="btn btn-success btn-sm">Aprobar</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
