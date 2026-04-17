'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const data = await apiFetch('/admin/verifications?status=PENDING&limit=50');
            setApplications(data.verifications || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchApplications(); }, []);

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
                Solicitudes de Verificación Pendientes
            </h1>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Abogado</th>
                            <th>Email</th>
                            <th>Especialidades</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No hay solicitudes pendientes.</td></tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id}>
                                    <td style={{ fontWeight: 600 }}>{app.user?.name}</td>
                                    <td>{app.user?.email}</td>
                                    <td>{(app.specialties || []).join(', ') || '—'}</td>
                                    <td>{new Date(app.updatedAt).toLocaleDateString('es-ES')}</td>
                                    <td>
                                        <Link href={`/dashboard/admin/verificaciones/${app.id}`} className="btn btn-primary btn-sm">
                                            Revisar Detalles
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
