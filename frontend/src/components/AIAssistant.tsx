'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

const SUGGESTIONS: Record<string, string[]> = {
    ABOGADO: ['¿Qué tengo para hoy?', '¿Cuántos casos llevo activos?', '¿Tengo citas esta semana?', '¿Qué presupuestos están aprobados?'],
    ADMIN:   ['¿Cómo está el bufete hoy?', '¿Cuántos casos nuevos esta semana?', '¿Qué citas hay hoy?', '¿Cuál es el área más activa?'],
    CLIENTE: ['¿Cómo va mi caso?', '¿Tengo citas próximas?', '¿Cuál es el estado de mi expediente?'],
};

export default function AIAssistant({ role }: { role: string }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: '¡Hola! Soy tu asistente IA. Tengo acceso a tus datos reales del sistema. ¿En qué te puedo ayudar?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const send = async (text: string) => {
        if (!text.trim() || loading) return;
        const userMsg = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);
        try {
            const res = await fetch('/api/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.response || data.error || 'Sin respuesta.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Error al conectar con la IA. Intenta de nuevo.' }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = SUGGESTIONS[role] ?? SUGGESTIONS['CLIENTE'];

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
                    width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F0B429, #e09b1a)',
                    border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(240,180,41,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', transition: 'transform 0.2s',
                }}
                title="Asistente IA"
            >
                {open ? '✕' : '🤖'}
            </button>

            {/* Panel del chat */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 999,
                    width: '360px', maxHeight: '520px',
                    background: '#0C2340', border: '1px solid rgba(240,180,41,0.3)',
                    borderRadius: '1rem', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(240,180,41,0.08)',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>🤖</span>
                        <div>
                            <div style={{ color: '#F0B429', fontWeight: 700, fontSize: '0.9rem' }}>Asistente IA</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>Acceso a tus datos en tiempo real</div>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%', padding: '0.6rem 0.9rem',
                                    borderRadius: m.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                                    background: m.role === 'user'
                                        ? 'linear-gradient(135deg, #F0B429, #e09b1a)'
                                        : 'rgba(255,255,255,0.07)',
                                    color: m.role === 'user' ? '#0C2340' : 'rgba(255,255,255,0.9)',
                                    fontSize: '0.82rem', lineHeight: '1.5',
                                    fontWeight: m.role === 'user' ? 600 : 400,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '0.6rem 1rem', borderRadius: '1rem 1rem 1rem 0.2rem',
                                    background: 'rgba(255,255,255,0.07)', color: '#F0B429', fontSize: '0.82rem',
                                }}>
                                    Consultando tus datos...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Sugerencias (solo si pocos mensajes) */}
                    {messages.length <= 2 && (
                        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {suggestions.map(s => (
                                <button key={s} onClick={() => send(s)} style={{
                                    background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.3)',
                                    color: '#F0B429', borderRadius: '999px', padding: '0.3rem 0.7rem',
                                    fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap',
                                }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', gap: '0.5rem',
                    }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                            placeholder="Pregunta algo..."
                            disabled={loading}
                            style={{
                                flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '0.6rem', padding: '0.55rem 0.8rem', color: '#fff',
                                fontSize: '0.82rem', outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => send(input)}
                            disabled={loading || !input.trim()}
                            style={{
                                background: 'linear-gradient(135deg, #F0B429, #e09b1a)',
                                border: 'none', borderRadius: '0.6rem', padding: '0 0.9rem',
                                color: '#0C2340', fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
                                opacity: loading || !input.trim() ? 0.5 : 1,
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
