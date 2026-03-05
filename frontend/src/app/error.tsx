'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '1.5rem', color: '#991B1B', marginBottom: '1rem' }}>
                ¡Ups! Algo salió mal
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Ha ocurrido un error inesperado en la aplicación.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => reset()}
                    className="btn btn-primary"
                >
                    Intentar de nuevo
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="btn"
                    style={{ border: '1px solid #ccc' }}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}
