'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { C } from '@/lib/theme';

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
            const params = new URLSearchParams({ limit: '100' });
            if (search) params.set('search', search);
            if (city) params.set('city', city);
            if (specialty) params.set('specialty', specialty);
            const data = await apiFetch(`/public/lawyers?${params.toString()}`);
            setLawyers(data.lawyers || []);
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
        <div className="lawyers-directory" style={{ 
            background: `linear-gradient(180deg, ${C.navyDeep} 0%, ${C.navy} 100%)`, 
            minHeight: '100vh',
            paddingTop: '6rem', // Reduced from 8rem
            paddingBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle glow */}
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '30%', background: `${C.yellow}03`, filter: 'blur(100px)', borderRadius: '50%' }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px' }}>
                <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ 
                        fontSize: '2.2rem', // Reduced from 3.5rem
                        marginBottom: '0.5rem', 
                        color: C.white,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                    }}>
                        Buscador de <span style={{ color: C.yellow }}>Abogados</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                        Encuentre al especialista ideal para sus necesidades legales.
                    </p>
                </header>

                {/* Compact Search Bar */}
                <form onSubmit={handleSearch} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '3rem',
                    flexWrap: 'wrap',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '0.75rem', // Reduced padding
                    borderRadius: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}>
                    <input
                        type="text"
                        placeholder="Nombre del abogado..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: '2', minWidth: '200px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.75rem',
                            color: C.white,
                            padding: '0.7rem 1rem',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                            flex: '1', minWidth: '120px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.75rem',
                            color: C.white,
                            padding: '0.7rem 1rem',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Especialidad"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        style={{
                            flex: '1', minWidth: '120px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.75rem',
                            color: C.white,
                            padding: '0.7rem 1rem',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="btn btn-primary" style={{
                        padding: '0.7rem 2rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        border: 'none',
                        background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                        color: C.navyDeep,
                        borderRadius: '0.75rem',
                    }}>
                        Buscar
                    </button>
                </form>

                {/* Compact Results Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ borderColor: C.yellow }} /></div>
                ) : lawyers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
                        No se encontraron resultados
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {lawyers.map((lawyer) => (
                            <div key={lawyer.id} style={{ 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                transition: 'transform 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }} className="lawyer-card-compact">
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '50px', height: '50px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: C.navyDeep, fontSize: '1.2rem', fontWeight: 800,
                                        boxShadow: `0 4px 10px ${C.yellow}30`
                                    }}>{lawyer.name.charAt(0)}</div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', color: C.white, marginBottom: '0.1rem' }}>{lawyer.name}</h3>
                                        {lawyer.lawyerProfile && (
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                                📍 {lawyer.lawyerProfile.city} · {lawyer.lawyerProfile.yearsExperience} años exp.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {lawyer.lawyerProfile && (
                                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                        {lawyer.lawyerProfile.specialties.slice(0, 3).map((s) => (
                                            <span key={s} style={{
                                                background: 'rgba(255,255,255,0.06)',
                                                color: 'rgba(255,255,255,0.8)',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                border: '1px solid rgba(255,255,255,0.08)'
                                            }}>{s}</span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginTop: 'auto',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid rgba(255,255,255,0.04)'
                                }}>
                                    <span style={{ fontWeight: 800, color: C.yellow, fontSize: '1.1rem' }}>
                                        ${lawyer.lawyerProfile?.ratePerHour || 0}/hr
                                    </span>
                                    <Link href={`/abogados/${lawyer.id}`} style={{
                                        padding: '0.5rem 1.25rem',
                                        fontSize: '0.8rem',
                                        background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
                                        color: C.navyDeep,
                                        fontWeight: 700,
                                        borderRadius: '0.5rem',
                                        textDecoration: 'none'
                                    }}>
                                        Ver Perfil
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .lawyer-card-compact:hover {
                    transform: translateY(-4px);
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(255,255,255,0.1) !important;
                }
            `}</style>
        </div>
    );
}
