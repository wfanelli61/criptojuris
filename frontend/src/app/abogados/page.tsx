'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Lawyer {
    id: string;
    name: string;
    lawyerProfile?: {
        specialties: string[];
        city: string;
        ratePerHour: number;
        photoUrl: string;
        yearsExperience: number;
        bio: string;
    };
}



export default function AbogadosPage() {
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [specialty, setSpecialty] = useState('');

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: '20' });
            if (search) params.set('search', search);
            if (city) params.set('city', city);
            if (specialty) params.set('specialty', specialty);
            const data = await apiFetch(`/public/lawyers?${params.toString()}`);
            setLawyers(data.lawyers);
        } catch {
            console.error('Failed to fetch lawyers');
            setLawyers([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchLawyers(); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLawyers();
    };

    return (
        <div className="page-section" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
            <div className="container">
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
                    Nuestros Abogados
                </h1>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                    Encuentra al profesional ideal para tu caso
                </p>

                {/* Filters */}
                <form onSubmit={handleSearch} style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    background: 'var(--color-white)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input"
                        style={{ flex: '1', minWidth: '200px' }}
                        aria-label="Buscar abogado por nombre"
                    />
                    <input
                        type="text"
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input"
                        style={{ width: '160px' }}
                        aria-label="Filtrar por ciudad"
                    />
                    <input
                        type="text"
                        placeholder="Especialidad"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="form-input"
                        style={{ width: '180px' }}
                        aria-label="Filtrar por especialidad"
                    />
                    <button type="submit" className="btn btn-primary">
                        Buscar
                    </button>
                </form>

                {/* Results */}
                {loading ? (
                    <div className="spinner" />
                ) : lawyers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                        No se encontraron abogados con los criterios seleccionados.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {lawyers.map((lawyer) => (
                            <div key={lawyer.id} className="card" style={{ overflow: 'hidden' }}>
                                <div style={{
                                    height: '4px',
                                    background: 'linear-gradient(90deg, var(--color-gold), var(--color-primary))',
                                    margin: '-1.5rem -1.5rem 1.5rem',
                                }} />
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '60px', height: '60px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--color-white)',
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {lawyer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                                            {lawyer.name}
                                        </h3>
                                        {lawyer.lawyerProfile && (
                                            <>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                                    📍 {lawyer.lawyerProfile.city} · {lawyer.lawyerProfile.yearsExperience} años exp.
                                                </p>
                                                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                                    {lawyer.lawyerProfile.specialties.map((s) => (
                                                        <span key={s} style={{
                                                            background: 'var(--color-primary-50)',
                                                            color: 'var(--color-primary)',
                                                            padding: '0.15rem 0.5rem',
                                                            borderRadius: 'var(--radius-full)',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                        }}>
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {lawyer.lawyerProfile?.bio && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: 1.6, margin: '0.75rem 0' }}>
                                        {lawyer.lawyerProfile.bio.substring(0, 120)}...
                                    </p>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    {lawyer.lawyerProfile?.ratePerHour && (
                                        <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem' }}>
                                            ${lawyer.lawyerProfile.ratePerHour}/hr
                                        </span>
                                    )}
                                    <Link href={`/abogados/${lawyer.id}`} className="btn btn-primary btn-sm">
                                        Ver Perfil
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
