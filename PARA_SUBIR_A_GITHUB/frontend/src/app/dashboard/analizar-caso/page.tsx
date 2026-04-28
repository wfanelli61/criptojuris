'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Analysis {
    areaLegal: string;
    gravedad: string;
    resumen: string;
    derechos: string[];
    riesgos: string[];
    estrategias: string[];
    pasosInmediatos: string[];
    tiempoEstimado: string;
    recomendacion: string;
}

const AREAS = [
    'Derecho Civil', 'Derecho Laboral', 'Derecho Penal', 'Derecho Familiar',
    'Derecho Mercantil', 'Derecho Administrativo', 'Derecho Tributario', 'No sé / Otro',
];

const GRAVEDAD_COLOR: Record<string, string> = {
    BAJA: '#10B981',
    MEDIA: '#F59E0B',
    ALTA: '#EF4444',
    CRITICA: '#7C3AED',
};

export default function AnalizarCasoPage() {
    const [descripcion, setDescripcion] = useState('');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAnalysis(null);
        setLoading(true);
        try {
            const data = await apiFetch('/ai/analizar-caso', {
                method: 'POST',
                body: JSON.stringify({ descripcion, area: area || undefined }),
            });
            setAnalysis(data.analysis);
        } catch (err: any) {
            setError(err.message || 'Error al analizar el caso. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleNuevoAnalisis = () => {
        setAnalysis(null);
        setDescripcion('');
        setArea('');
        setError('');
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
                    🤖 Análisis de Caso con IA
                </h1>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                    Describe tu situación legal y la IA evaluará el caso, tus derechos y los pasos a seguir.
                </p>
            </div>

            {!analysis ? (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                                Área legal (opcional)
                            </label>
                            <select
                                value={area}
                                onChange={e => setArea(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.65rem 0.85rem',
                                    border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.9rem', color: '#374151', background: '#fff',
                                    outline: 'none',
                                }}
                            >
                                <option value="">Selecciona un área (opcional)</option>
                                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                                Describe tu situación legal *
                            </label>
                            <textarea
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Explica en detalle qué ocurrió, fechas relevantes, personas involucradas, documentos que tienes, etc. Cuanto más detalle, mejor será el análisis..."
                                rows={7}
                                required
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.9rem', color: '#374151', resize: 'vertical',
                                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                                {descripcion.length} caracteres (mínimo 20)
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || descripcion.trim().length < 20}
                            className="btn btn-primary"
                            style={{ padding: '0.85rem', fontSize: '0.95rem', opacity: (loading || descripcion.trim().length < 20) ? 0.6 : 1 }}
                        >
                            {loading ? '🔄 Analizando con IA...' : '🔍 Analizar Caso'}
                        </button>

                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center' }}>
                            Este análisis es orientativo y no reemplaza la consulta con un abogado profesional.
                        </p>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Header del resultado */}
                    <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'var(--color-primary-dark)', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Área Legal Identificada</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{analysis.areaLegal}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Nivel de Gravedad</div>
                                <span style={{
                                    background: GRAVEDAD_COLOR[analysis.gravedad] || '#6B7280',
                                    color: 'white', padding: '0.3rem 0.85rem',
                                    borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem',
                                }}>
                                    {analysis.gravedad}
                                </span>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>{analysis.resumen}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                        <Section title="⚖️ Tus Derechos" items={analysis.derechos} color="#0C2340" />
                        <Section title="⚠️ Riesgos Identificados" items={analysis.riesgos} color="#EF4444" />
                        <Section title="💡 Estrategias Recomendadas" items={analysis.estrategias} color="#1B4D8F" />
                        <Section title="✅ Pasos Inmediatos" items={analysis.pasosInmediatos} color="#10B981" />
                    </div>

                    <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>⏱ Tiempo Estimado del Proceso</div>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{analysis.tiempoEstimado}</div>
                            </div>
                            <div style={{ flex: 2, minWidth: 280 }}>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>🎯 Recomendación Principal</div>
                                <div style={{ color: '#374151', lineHeight: 1.5 }}>{analysis.recomendacion}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button onClick={handleNuevoAnalisis} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                            + Nuevo Análisis
                        </button>
                        <a href="/abogados" className="btn" style={{ padding: '0.75rem 1.5rem', background: '#F0F2F7', color: 'var(--color-primary-dark)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                            🔍 Buscar Abogado
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
    return (
        <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color, marginBottom: '0.75rem' }}>{title}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                        <span style={{ color, fontWeight: 700, flexShrink: 0 }}>•</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
