'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        }
        setLoading(false);
    };

    return (
        <div className="page-section" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #060F1D 0%, #0C2340 50%, #1B3B5A 100%)',
            paddingTop: '6rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '360px',
                animation: 'fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '1.75rem 1.5rem',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '2rem' }}>⚖️</span>
                        <h1 style={{ fontSize: '1.3rem', color: '#0C2340', marginTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                            Iniciar Sesión
                        </h1>
                        <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                            Accede a tu cuenta de BufeteLegal
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.6rem 0.8rem', background: '#FEE2E2',
                            borderRadius: '0.5rem', color: '#991B1B',
                            fontSize: '0.8rem', marginBottom: '0.75rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}
                                htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                autoComplete="email"
                                style={{
                                    width: '100%', padding: '0.6rem 0.85rem',
                                    border: '2px solid #E5E7EB', borderRadius: '0.6rem',
                                    fontSize: '0.88rem', fontFamily: 'var(--font-body)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    outline: 'none', background: '#F9FAFB',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F0B429';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240, 180, 41, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                                    e.currentTarget.style.background = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.background = '#F9FAFB';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}
                                htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                style={{
                                    width: '100%', padding: '0.6rem 0.85rem',
                                    border: '2px solid #E5E7EB', borderRadius: '0.6rem',
                                    fontSize: '0.88rem', fontFamily: 'var(--font-body)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    outline: 'none', background: '#F9FAFB',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F0B429';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240, 180, 41, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                                    e.currentTarget.style.background = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.background = '#F9FAFB';
                                }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{
                            width: '100%', marginTop: '0.25rem', padding: '0.7rem',
                            background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                            borderRadius: '0.6rem', fontSize: '0.92rem',
                        }}>
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: '#6B7280' }}>
                        ¿No tienes cuenta?{' '}
                        <Link href="/registro" style={{ color: '#0C2340', fontWeight: 600 }}>Regístrate aquí</Link>
                    </p>

                    <div style={{
                        marginTop: '1rem', padding: '0.65rem',
                        background: '#EFF6FF',
                        borderRadius: '0.5rem',
                        fontSize: '0.72rem',
                        color: '#4B5563',
                        textAlign: 'center',
                    }}>
                        <strong style={{ color: '#0C2340' }}>Demo:</strong> <code style={{ fontSize: '0.7rem' }}>admin@bufete.com</code> / <code style={{ fontSize: '0.7rem' }}>123456</code>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
