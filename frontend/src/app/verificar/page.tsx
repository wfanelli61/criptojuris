'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No se proporcionó un token de verificación.');
            return;
        }

        apiFetch(`/auth/verify/${token}`)
            .then((data) => {
                setStatus('success');
                setMessage(data.message || 'Cuenta verificada exitosamente.');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || 'Token inválido o expirado.');
            });
    }, [token]);

    return (
        <div className="page-section" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #060F1D 0%, #0C2340 50%, #1B3B5A 100%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '2.5rem 2rem',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                }}>
                    {status === 'loading' && (
                        <>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                border: '4px solid #E5E7EB', borderTopColor: '#F0B429',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 1.5rem',
                            }} />
                            <h2 style={{ fontSize: '1.2rem', color: '#0C2340', fontFamily: 'var(--font-heading)' }}>
                                Verificando tu cuenta...
                            </h2>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem', fontSize: '1.75rem', color: '#fff',
                            }}>✓</div>
                            <h2 style={{ fontSize: '1.3rem', color: '#0C2340', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                                ¡Cuenta Verificada!
                            </h2>
                            <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                {message}
                            </p>
                            <Link href="/login" className="btn btn-primary" style={{
                                width: '100%', display: 'block', textAlign: 'center',
                                background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                            }}>
                                Iniciar Sesión
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem', fontSize: '1.75rem', color: '#fff',
                            }}>✕</div>
                            <h2 style={{ fontSize: '1.3rem', color: '#0C2340', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                                Error de Verificación
                            </h2>
                            <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                {message}
                            </p>
                            <Link href="/registro" className="btn btn-primary" style={{
                                width: '100%', display: 'block', textAlign: 'center',
                                background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                            }}>
                                Volver al Registro
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function VerificarPage() {
    return (
        <Suspense fallback={
            <div className="page-section" style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #060F1D 0%, #0C2340 50%, #1B3B5A 100%)',
            }}>
                <p style={{ color: '#fff' }}>Cargando...</p>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
