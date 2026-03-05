'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const GEMINI_API_KEY = ''; // Se configura en .env

const SYSTEM_PROMPT = `Eres el Asistente Legal IA de BufeteLegal, una plataforma que conecta personas con abogados especializados en Venezuela. Tu rol:

1. ORIENTACIÓN LEGAL: Explica conceptos legales en lenguaje simple y claro. NO das asesoría legal vinculante.
2. CLASIFICACIÓN: Identifica el tipo de problema legal del usuario (civil, penal, laboral, familiar, mercantil, tributario, inmobiliario).
3. RECOMENDACIÓN: Sugiere qué tipo de abogado necesitan y recomiéndalos a consultar con un especialista en la plataforma.
4. INFORMACIÓN: Responde preguntas generales sobre procesos legales, plazos, documentos necesarios.

REGLAS:
- Siempre aclara que NO eres abogado y que tus respuestas son orientativas.
- Recomienda consultar con un abogado de la plataforma para casos específicos.
- Sé empático, profesional y claro.
- Responde en español.
- Si no sabes algo, dilo honestamente.
- Al final de respuestas relevantes, sugiere: "¿Desea que le conecte con un abogado especialista?"
- Mantén respuestas concisas (máximo 3 párrafos).`;

const greetingMessage: Message = {
    id: 'greeting',
    role: 'assistant',
    content: '¡Hola! 👋 Soy el Asistente Legal IA de BufeteLegal. Puedo ayudarle a:\n\n• Entender su situación legal\n• Identificar qué tipo de abogado necesita\n• Explicar procesos y documentos legales\n• Conectarle con un especialista\n\n¿En qué puedo ayudarle hoy?',
    timestamp: new Date(),
};

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([greetingMessage]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setHasNewMessages(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Build conversation history for Gemini
            const history = messages
                .filter(m => m.id !== 'greeting')
                .map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));

            // Try to use the backend endpoint first, then fallback to direct Gemini API
            let responseText = '';

            try {
                const backendRes = await fetch('http://localhost:4000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, history }),
                });
                if (backendRes.ok) {
                    const data = await backendRes.json();
                    responseText = data.response;
                }
            } catch {
                // Backend not available, use mock response
            }

            if (!responseText) {
                // Fallback: Generate a helpful mock response based on keywords
                responseText = generateMockResponse(text);
            }

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);

            if (!isOpen) setHasNewMessages(true);
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Disculpe, tuve un problema técnico. ¿Podría intentar de nuevo?',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: '100px', right: '24px', zIndex: 10000,
                    width: '400px', maxWidth: 'calc(100vw - 48px)', height: '550px', maxHeight: 'calc(100vh - 140px)',
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--color-white)', borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0C2340, #1B4D8F)',
                        padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(240,180,41,0.3)',
                        }}>
                            🤖
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Asistente Legal IA</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#13C4A3' }} />
                                Powered by Gemini · En línea
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '1rem 1rem 0.5rem',
                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                        background: '#F8F9FB',
                    }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    maxWidth: '85%', padding: '0.85rem 1rem',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #0C2340, #1B4D8F)'
                                        : '#fff',
                                    color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                                    fontSize: '0.88rem', lineHeight: 1.7,
                                    boxShadow: msg.role === 'user' ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                                    whiteSpace: 'pre-line',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--color-border-light)',
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '0.85rem 1.25rem', borderRadius: '16px 16px 16px 4px',
                                    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    border: '1px solid var(--color-border-light)',
                                    display: 'flex', gap: '0.35rem', alignItems: 'center',
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            background: 'var(--color-gold)',
                                            animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 1 && (
                        <div style={{
                            padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
                            borderTop: '1px solid var(--color-border-light)', background: '#fff',
                        }}>
                            {['Tengo un problema laboral', 'Necesito un contrato', 'Me quiero divorciar', 'Consulta tributaria'].map(q => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50); }}
                                    style={{
                                        background: 'var(--color-primary-50)', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-full)', padding: '0.35rem 0.75rem',
                                        fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer',
                                        fontWeight: 500, transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--color-primary)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--color-primary-50)';
                                        e.currentTarget.style.color = 'var(--color-primary)';
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border-light)',
                        display: 'flex', gap: '0.5rem', background: '#fff',
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Escriba su consulta legal..."
                            style={{
                                flex: 1, border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-lg)', padding: '0.7rem 1rem',
                                fontSize: '0.88rem', fontFamily: 'var(--font-body)',
                                outline: 'none', transition: 'border-color 0.3s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-gold)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                background: 'linear-gradient(135deg, #F0B429, #C68A0A)',
                                border: 'none', borderRadius: 'var(--radius-lg)',
                                width: '44px', height: '44px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.1rem', color: '#fff',
                                opacity: loading || !input.trim() ? 0.5 : 1,
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(240,180,41,0.3)',
                            }}
                        >
                            ➤
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div style={{
                        padding: '0.4rem 1rem', background: '#FFFBEB',
                        borderTop: '1px solid #FDE68A',
                        fontSize: '0.65rem', color: '#92400E', textAlign: 'center',
                    }}>
                        ⚠️ Las respuestas son orientativas. Consulte con un abogado para asesoría formal.
                    </div>
                </div>
            )}

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: isLandingPage ? '24px' : '16px', right: isLandingPage ? '24px' : '16px', zIndex: 9999,
                    width: isLandingPage ? '64px' : '48px', height: isLandingPage ? '64px' : '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0C2340, #1B4D8F)',
                    border: isLandingPage ? '3px solid rgba(240,180,41,0.4)' : '2px solid rgba(240,180,41,0.4)',
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(12,35,64,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isLandingPage ? '1.6rem' : '1.2rem', color: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation: !isOpen && isLandingPage ? 'float 3s ease-in-out infinite' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(12,35,64,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(12,35,64,0.4)'; }}
                aria-label="Abrir asistente legal IA"
            >
                {isOpen ? '✕' : '🤖'}
                {hasNewMessages && !isOpen && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: isLandingPage ? '20px' : '14px', height: isLandingPage ? '20px' : '14px', borderRadius: '50%',
                        background: '#EF4444', border: isLandingPage ? '3px solid #fff' : '2px solid #fff',
                    }} />
                )}
            </button>

            {/* Tooltip when first visiting (only on landing page) */}
            {!isOpen && messages.length <= 1 && isLandingPage && (
                <div style={{
                    position: 'fixed', bottom: '96px', right: '24px', zIndex: 9998,
                    background: '#fff', padding: '0.75rem 1.25rem',
                    borderRadius: '14px 14px 4px 14px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    fontSize: '0.85rem', color: 'var(--color-text)',
                    maxWidth: '220px', lineHeight: 1.5,
                    animation: 'fadeInUp 0.5s ease 2s both',
                    border: '1px solid var(--color-border-light)',
                }}>
                    <strong style={{ color: 'var(--color-primary-dark)' }}>¿Necesita orientación legal?</strong>
                    <br />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                        Nuestro asistente IA puede ayudarle. ¡Es gratis! 💬
                    </span>
                </div>
            )}
        </>
    );
}

// Mock response generator for when API is not available
function generateMockResponse(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes('laboral') || lower.includes('despido') || lower.includes('trabajo') || lower.includes('sueldo') || lower.includes('salario')) {
        return `Entiendo que tiene una situación laboral. Los casos laborales son muy comunes y hay mucho que se puede hacer legalmente para proteger sus derechos como trabajador.

En Venezuela, la Ley Orgánica del Trabajo (LOTTT) protege ampliamente a los trabajadores. Dependiendo de su caso, podría tener derecho a:
• **Prestaciones sociales** acumuladas
• **Indemnización por despido** injustificado
• **Salarios caídos** si aplica
• **Beneficios adeudados** (vacaciones, utilidades, etc.)

Le recomiendo consultar con uno de nuestros abogados laboralistas para evaluar su caso específico. Ellos pueden revisar su situación y explicarle sus opciones.

👉 ¿Desea que le conecte con un abogado laboralista especializado?`;
    }

    if (lower.includes('divorcio') || lower.includes('separación') || lower.includes('custodia') || lower.includes('familia')) {
        return `Comprendo que está pasando por una situación familiar difícil. Quiero que sepa que hay soluciones legales para cada caso.

En temas de derecho de familia, los aspectos principales a considerar son:
• **Disolución del vínculo matrimonial** (divorcio por mutuo acuerdo o contencioso)
• **Custodia de los hijos** y régimen de visitas
• **Pensión alimenticia** para los hijos
• **División de bienes** de la comunidad conyugal

Cada caso es diferente y requiere una evaluación personalizada. Un abogado de familia puede guiarle paso a paso y explicarle los plazos y costos estimados.

👉 ¿Le gustaría que le conecte con un abogado de familia?`;
    }

    if (lower.includes('contrato') || lower.includes('acuerdo') || lower.includes('firmar')) {
        return `Los contratos son documentos fundamentales para proteger sus intereses. Puedo orientarle sobre los aspectos generales.

Antes de firmar cualquier contrato, es importante verificar:
• **Cláusulas de responsabilidad** y penalidades
• **Condiciones de pago** y plazos
• **Causales de rescisión** y sus consecuencias
• **Jurisdicción aplicable** en caso de conflicto
• **Garantías** y contraprestaciones

Un abogado puede revisar su contrato cláusula por cláusula para identificar riesgos y proteger sus intereses. Este tipo de revisión previene problemas futuros mucho más costosos.

👉 ¿Desea que un abogado especialista revise su contrato?`;
    }

    if (lower.includes('tributario') || lower.includes('impuesto') || lower.includes('seniat') || lower.includes('fiscal')) {
        return `Las consultas tributarias requieren atención especializada, ya que las normas fiscales cambian con frecuencia.

Los temas tributarios más comunes incluyen:
• **Declaración del ISLR** (Impuesto Sobre la Renta)
• **IVA** y sus obligaciones formales
• **Retenciones** y comprobantes fiscales
• **Sanciones del SENIAT** y cómo resolverlas
• **Planificación fiscal** legal para optimizar su carga tributaria

Es muy importante actuar con asesoría profesional para evitar sanciones o multas. Nuestros abogados tributaristas conocen la normativa actual.

👉 ¿Le gustaría consultar con un abogado tributarista?`;
    }

    if (lower.includes('inmueble') || lower.includes('casa') || lower.includes('apartamento') || lower.includes('terreno') || lower.includes('alquiler') || lower.includes('arrendamiento')) {
        return `Los temas inmobiliarios requieren especial cuidado legal para proteger su inversión.

Podemos ayudarle con:
• **Compraventa de inmuebles** (verificación de documentos, cargas, gravámenes)
• **Arrendamientos** (contratos, derechos del inquilino/propietario)
• **Desalojos** y el procedimiento legal correcto
• **Documentación registral** (títulos de propiedad, registro inmobiliario)
• **Hipotecas** y financiamiento

Antes de cualquier operación inmobiliaria, es crucial verificar la legalidad de los documentos para evitar estafas o problemas futuros.

👉 ¿Necesita un abogado inmobiliario que revise su caso?`;
    }

    if (lower.includes('penal') || lower.includes('denuncia') || lower.includes('delito') || lower.includes('preso') || lower.includes('detenido')) {
        return `Las situaciones penales son delicadas y requieren acción rápida. Es importante contar con asistencia legal lo antes posible.

En materia penal, es fundamental:
• **Actuar rápido**: Los plazos procesales son estrictos
• **Conocer sus derechos**: Derecho a defensa, presunción de inocencia, debido proceso
• **No declarar sin abogado**: Siempre tenga asistencia legal antes de dar declaraciones
• **Documentar todo**: Guarde evidencias y documentos relevantes

Si usted o un familiar está detenido, tiene derecho a un abogado desde el primer momento. Nuestros penalistas están disponibles para casos urgentes.

⚠️ **En casos penales urgentes, le recomiendo contactar a un abogado de inmediato.**

👉 ¿Desea que le conecte urgentemente con un abogado penalista?`;
    }

    // Generic response
    return `Gracias por su consulta. Puedo ayudarle a entender mejor su situación legal y orientarle hacia el tipo de abogado que necesita.

Para poder darle una mejor orientación, ¿podría contarme más detalles?
• ¿Se trata de un tema **laboral, familiar, civil, penal, tributario o inmobiliario**?
• ¿Ya ha tomado alguna acción legal?
• ¿Tiene documentos relevantes sobre su caso?

Con esa información podré orientarle mejor y conectarle con el especialista adecuado en nuestra plataforma.

💡 También puede hacer clic en las opciones rápidas para consultas comunes.`;
}
