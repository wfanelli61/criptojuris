'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: 'CLIENTE' });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [message, setMessage] = useState('');
    const [metrics, setMetrics] = useState<any>(null);

    const fetchData = async () => {
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            const [userData, metricsData] = await Promise.all([
                apiFetch(`/admin/users?${params.toString()}`),
                apiFetch('/admin/metrics'),
            ]);
            setUsers(userData.users);
            setMetrics(metricsData.metrics);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
            setShowForm(false);
            setForm({ email: '', password: '', name: '', phone: '', role: 'CLIENTE' });
            setMessage('Usuario creado exitosamente');
            fetchData();
        } catch (err: any) {
            setMessage(err.message || 'Error al crear usuario');
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;
        try {
            await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    const changeRole = async (id: string, role: string) => {
        try {
            await apiFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Error');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        fetchData();
    };

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)' }}>Gestión de Usuarios</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
                </button>
            </div>

            {/* Metrics */}
            {metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Usuarios', value: metrics.totalUsers, bg: '#EBF0F6', color: 'var(--color-primary)' },
                        { label: 'Abogados', value: metrics.totalLawyers, bg: '#FEF3C7', color: '#92400E' },
                        { label: 'Clientes', value: metrics.totalClients, bg: '#D1FAE5', color: '#065F46' },
                        { label: 'Citas Pendientes', value: metrics.pendingAppointments, bg: '#FEE2E2', color: '#991B1B' },
                        { label: 'Servicios', value: metrics.totalServices, bg: '#DBEAFE', color: '#1E40AF' },
                    ].map((m) => (
                        <div key={m.label} style={{ background: m.bg, padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>{m.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {message && (
                <div style={{ padding: '0.75rem', background: '#D1FAE5', borderRadius: 'var(--radius-md)', color: '#065F46', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {message}
                    <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Crear Usuario</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group"><label className="form-label">Nombre</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                        <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                        <div className="form-group"><label className="form-label">Contraseña</label><input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
                        <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Rol</label>
                            <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                <option value="CLIENTE">Cliente</option>
                                <option value="ABOGADO">Abogado</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'end' }}>
                            <button type="submit" className="btn btn-primary">Crear</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input className="form-input" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
                <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '140px' }}>
                    <option value="">Todos los roles</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="ABOGADO">Abogado</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button type="submit" className="btn btn-secondary">Filtrar</button>
            </form>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Creado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: 500 }}>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.phone || '—'}</td>
                                <td>
                                    <select className="form-input" value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}>
                                        <option value="CLIENTE">Cliente</option>
                                        <option value="ABOGADO">Abogado</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                                <td><button onClick={() => deleteUser(u.id)} className="btn btn-danger btn-sm">Eliminar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
