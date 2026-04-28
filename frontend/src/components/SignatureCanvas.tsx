'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
    onConfirm: (base64: string) => void;
    onCancel: () => void;
    signerLabel: string;
}

export default function SignatureCanvas({ onConfirm, onCancel, signerLabel }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0C2340';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            const t = e.touches[0];
            return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
        }
        return { x: ((e as MouseEvent).clientX - rect.left) * scaleX, y: ((e as MouseEvent).clientY - rect.top) * scaleY };
    };

    const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        drawing.current = true;
        lastPos.current = getPos(e, canvas);
        setIsEmpty(false);
    }, []);

    const draw = useCallback((e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (!drawing.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const pos = getPos(e, canvas);
        if (lastPos.current) {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
        lastPos.current = pos;
    }, []);

    const stopDraw = useCallback(() => {
        drawing.current = false;
        lastPos.current = null;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDraw);
        return () => {
            canvas.removeEventListener('mousedown', startDraw);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDraw);
            canvas.removeEventListener('mouseleave', stopDraw);
            canvas.removeEventListener('touchstart', startDraw);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDraw);
        };
    }, [startDraw, draw, stopDraw]);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
    };

    const confirm = () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;
        onConfirm(canvas.toDataURL('image/png'));
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
            <div style={{
                background: '#fff', borderRadius: '1.25rem', width: '100%',
                maxWidth: '520px', overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E9F0', background: 'linear-gradient(135deg,#0C2340,#1B4D8F)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>✍️ Firma Digital</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>{signerLabel}</div>
                </div>

                {/* Canvas */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                        Dibujá tu firma con el mouse o con el dedo:
                    </div>
                    <div style={{ border: '2px dashed #D1D5DB', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'crosshair', background: '#FAFAFA' }}>
                        <canvas
                            ref={canvasRef}
                            width={480}
                            height={180}
                            style={{ display: 'block', width: '100%', height: '180px', touchAction: 'none' }}
                        />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.4rem', textAlign: 'center' }}>
                        Tu firma quedará registrada con fecha y hora en el sistema
                    </div>
                </div>

                {/* Acciones */}
                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{
                        padding: '0.55rem 1.2rem', borderRadius: '0.6rem', border: '1px solid #D1D5DB',
                        background: '#fff', color: '#374151', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}>
                        Cancelar
                    </button>
                    <button onClick={clear} style={{
                        padding: '0.55rem 1.2rem', borderRadius: '0.6rem', border: '1px solid #D1D5DB',
                        background: '#F9FAFB', color: '#374151', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}>
                        Limpiar
                    </button>
                    <button onClick={confirm} disabled={isEmpty} style={{
                        padding: '0.55rem 1.4rem', borderRadius: '0.6rem', border: 'none',
                        background: isEmpty ? '#E5E9F0' : '#0C2340',
                        color: isEmpty ? '#9CA3AF' : '#fff',
                        fontSize: '0.85rem', fontWeight: 700, cursor: isEmpty ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                    }}>
                        Confirmar firma
                    </button>
                </div>
            </div>
        </div>
    );
}
