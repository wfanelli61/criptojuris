'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function RegistroPage() {
    const [step, setStep] = useState<'role' | 'form' | 'success'>('role');
    const [role, setRole] = useState<'CLIENTE' | 'ABOGADO' | ''>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (selectedRole: 'CLIENTE' | 'ABOGADO') => {
        setRole(selectedRole);
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name, role }),
            });
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Error al registrar');
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
            {/* === STEP 1: ROLE SELECTION === */}
            {step === 'role' && (
                <div style={{
                    width: '100%',
                    maxWidth: '520px',
                    textAlign: 'center',
                    animation: 'fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>⚖️</span>
                    <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>
                        Crear Cuenta
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        ¿Cómo deseas usar BufeteLegal?
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Cliente Card */}
                        <button
                            onClick={() => handleRoleSelect('CLIENTE')}
                            className="role-card"
                            style={{
                                padding: '2rem 1.25rem',
                                borderRadius: '1rem',
                                border: '2px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.04)',
                                backdropFilter: 'blur(12px)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                textAlign: 'center',
                                color: '#fff',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                                e.currentTarget.style.borderColor = '#F0B429';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(240, 180, 41, 0.2)';
                                e.currentTarget.style.background = 'rgba(240, 180, 41, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                        >
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem', fontSize: '1.5rem',
                            }}>👤</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>
                                Soy Cliente
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                                Busco un abogado para resolver mi caso legal
                            </p>
                        </button>

                        {/* Abogado Card */}
                        <button
                            onClick={() => handleRoleSelect('ABOGADO')}
                            className="role-card"
                            style={{
                                padding: '2rem 1.25rem',
                                borderRadius: '1rem',
                                border: '2px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.04)',
                                backdropFilter: 'blur(12px)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                textAlign: 'center',
                                color: '#fff',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                                e.currentTarget.style.borderColor = '#F0B429';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(240, 180, 41, 0.2)';
                                e.currentTarget.style.background = 'rgba(240, 180, 41, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                        >
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem', fontSize: '1.5rem',
                            }}>⚖️</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>
                                Soy Abogado
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                                Quiero ofrecer mis servicios legales en la plataforma
                            </p>
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" style={{ color: '#F0B429', fontWeight: 600 }}>Inicia sesión</Link>
                    </p>
                </div>
            )}

            {/* === STEP 2: REGISTRATION FORM === */}
            {step === 'form' && (
                <div style={{
                    width: '100%',
                    maxWidth: '380px',
                    animation: 'fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1.25rem',
                        padding: '2rem 1.75rem',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                background: role === 'ABOGADO'
                                    ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                                    : 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
                                padding: '0.3rem 0.8rem', borderRadius: '9999px',
                                fontSize: '0.72rem', fontWeight: 700,
                                color: role === 'ABOGADO' ? '#92400E' : '#1E40AF',
                                marginBottom: '0.75rem',
                            }}>
                                {role === 'ABOGADO' ? '⚖️ Registro como Abogado' : '👤 Registro como Cliente'}
                            </div>
                            <h1 style={{ fontSize: '1.3rem', color: '#0C2340', fontFamily: 'var(--font-heading)' }}>
                                Crear Cuenta
                            </h1>
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
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                    Nombres y Apellidos
                                </label>
                                <input
                                    type="text"
                                    className="physics-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    required
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '2px solid #E5E7EB', borderRadius: '0.6rem',
                                        fontSize: '0.9rem', fontFamily: 'var(--font-body)',
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
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    className="physics-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    required
                                    autoComplete="email"
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '2px solid #E5E7EB', borderRadius: '0.6rem',
                                        fontSize: '0.9rem', fontFamily: 'var(--font-body)',
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
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="physics-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    autoComplete="new-password"
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '2px solid #E5E7EB', borderRadius: '0.6rem',
                                        fontSize: '0.9rem', fontFamily: 'var(--font-body)',
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="physics-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite la contraseña"
                                    required
                                    autoComplete="new-password"
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '2px solid #E5E7EB', borderRadius: '0.6rem',
                                        fontSize: '0.9rem', fontFamily: 'var(--font-body)',
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

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '0.95rem',
                                    background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                                    borderRadius: '0.6rem',
                                }}
                            >
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </button>
                        </form>

                        <button
                            onClick={() => { setStep('role'); setError(''); }}
                            style={{
                                width: '100%', marginTop: '0.75rem', padding: '0.5rem',
                                background: 'transparent', border: '1px solid #E5E7EB',
                                borderRadius: '0.6rem', cursor: 'pointer',
                                fontSize: '0.8rem', color: '#6B7280',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
                        >
                            ← Cambiar tipo de cuenta
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: '#6B7280' }}>
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" style={{ color: '#0C2340', fontWeight: 600 }}>Inicia sesión</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* === STEP 3: SUCCESS MESSAGE === */}
            {step === 'success' && (
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    textAlign: 'center',
                    animation: 'fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1.25rem',
                        padding: '2.5rem 2rem',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem', fontSize: '1.75rem',
                        }}>✅</div>
                        <h2 style={{ fontSize: '1.3rem', color: '#0C2340', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                            ¡Registro exitoso!
                        </h2>
                        <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                            Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión con tu correo <strong style={{ color: '#0C2340' }}>{email}</strong>.
                        </p>
                        <Link href="/login" className="btn btn-primary" style={{
                            width: '100%', display: 'block', textAlign: 'center',
                            background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                        }}>
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
