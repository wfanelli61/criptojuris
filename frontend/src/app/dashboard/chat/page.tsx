'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { apiFetch } from '@/lib/api';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    conversationId: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    sender: {
        id: string;
        name: string;
    };
}

interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        name: string;
        role: string;
        lawyerProfile?: { photoUrl: string };
    }>;
    updatedAt: string;
    messages: Message[];
}

export default function ChatPage() {
    const { user } = useAuth();
    const { socket, isConnected, sendMessage, joinConversation } = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showExpediente, setShowExpediente] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persistencia del tema
    useEffect(() => {
        const saved = localStorage.getItem('chat-theme');
        if (saved) setIsDarkMode(saved === 'dark');
    }, []);

    const toggleTheme = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        localStorage.setItem('chat-theme', next ? 'dark' : 'light');
    };

    // Cargar conversaciones
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await apiFetch('/chat/conversations');
                setConversations(data);
                if (data.length > 0 && !selectedId) {
                    setSelectedId(data[0].id);
                }
            } catch (err) {
                console.error('Error loading conversations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [selectedId]);

    // Cargar mensajes al seleccionar una conversación
    useEffect(() => {
        if (!selectedId) return;

        const fetchMessages = async () => {
            try {
                const data = await apiFetch(`/chat/conversations/${selectedId}/messages`);
                setMessages(data);
                joinConversation(selectedId);
            } catch (err) {
                console.error('Error loading messages:', err);
            }
        };
        fetchMessages();
    }, [selectedId, joinConversation]);

    // Escuchar nuevos mensajes
    useEffect(() => {
        if (!socket) return;

        const onNewMessage = (message: Message) => {
            if (message.conversationId === selectedId) {
                setMessages(prev => [...prev, message]);
            }

            setConversations(prev => {
                const existing = prev.find(c => c.id === message.conversationId);
                if (!existing) {
                    // Recargar si es una nueva conversación para este socket
                    apiFetch('/chat/conversations').then(setConversations);
                    return prev;
                }
                return prev.map(conv => {
                    if (conv.id === message.conversationId) {
                        return { ...conv, updatedAt: message.createdAt, messages: [message] };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            });
        };

        socket.on('new_message', onNewMessage);
        return () => {
            socket.off('new_message');
        };
    }, [socket, selectedId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedId) return;
        sendMessage(selectedId, input.trim());
        setInput('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (!file || !selectedId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const data = await apiFetch(`/chat/conversations/${selectedId}/upload`, {
                method: 'POST',
                body: formData,
            });
            // El mensaje se enviará por socket desde el backend (si lo implementamos) 
            // o lo recibiremos por el evento de socket. Por ahora lo añadimos localmente si no llega por socket.
            setMessages(prev => [...prev, data]);
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Error al subir el archivo');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" />
        </div>
    );

    const selectedConv = conversations.find(c => c.id === selectedId);
    const otherParticipant = selectedConv?.participants[0];

    // Design Tokens
    const theme = {
        bg: isDarkMode ? '#0F172A' : '#F8FAFC',
        sidebar: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        header: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        text: isDarkMode ? '#F1F5F9' : '#1E293B',
        textMuted: isDarkMode ? '#94A3B8' : '#64748B',
        border: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        bubbleMe: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        bubbleMeText: '#FFFFFF',
        bubbleOther: isDarkMode ? '#334155' : '#FFFFFF',
        bubbleOtherText: isDarkMode ? '#F1F5F9' : '#1E293B',
        accent: '#6366F1',
        inputBg: isDarkMode ? '#1E293B' : '#F1F5F9',
        activeItem: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
    };

    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 140px)',
            background: theme.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            border: `1px solid ${theme.border}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Sidebar */}
            <div style={{
                width: '320px',
                background: theme.sidebar,
                backdropFilter: 'blur(20px)',
                borderRight: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s'
            }}>
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.text, letterSpacing: '-0.02em' }}>Mensajes</h2>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: theme.inputBg,
                            border: 'none',
                            borderRadius: '12px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(15deg)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
                    {conversations.length === 0 ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📫</div>
                            No hay conversaciones aún.
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other = conv.participants[0];
                            const isActive = selectedId === conv.id;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedId(conv.id)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        background: isActive ? theme.activeItem : 'transparent',
                                        marginBottom: '8px',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        border: isActive ? `1px solid ${theme.accent}33` : '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: isActive ? theme.accent : theme.inputBg,
                                        color: isActive ? '#fff' : theme.text,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        flexShrink: 0,
                                        boxShadow: isActive ? `0 8px 16px ${theme.accent}44` : 'none'
                                    }}>
                                        {other?.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, color: theme.text, fontSize: '0.95rem', marginBottom: '2px' }}>{other?.name}</div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: theme.textMuted,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {conv.messages[0]?.content || 'Inicia un chat'}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: theme.textMuted }}>
                                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: theme.bg,
                position: 'relative'
            }}>
                {/* Background Sparkles (Optional Animation) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.03,
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at 10% 20%, #6366f1 0%, transparent 40%), radial-gradient(circle at 90% 80%, #8b5cf6 0%, transparent 40%)'
                }} />

                {selectedId ? (
                    <>
                        {/* Header */}
                        <div style={{
                            padding: '16px 24px',
                            background: theme.header,
                            backdropFilter: 'blur(20px)',
                            borderBottom: `1px solid ${theme.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 10
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${theme.accent}, #A78BFA)`,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}>
                                    {otherParticipant?.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: theme.text, fontSize: '1.05rem' }}>{otherParticipant?.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10B981' : '#94A3B8' }} />
                                        <div style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 500 }}>
                                            {isConnected ? 'En línea' : 'Desconectado'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowExpediente(!showExpediente)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    background: showExpediente ? theme.accent : 'transparent',
                                    color: showExpediente ? '#fff' : theme.accent,
                                    border: `1px solid ${theme.accent}`,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {showExpediente ? 'Cerrar Expediente' : '📁 Ver Expediente'}
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '32px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            zIndex: 1
                        }}>
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                const prevMsg = messages[idx - 1];
                                const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

                                return (
                                    <div
                                        key={msg.id}
                                        style={{
                                            maxWidth: '75%',
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isMe ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{
                                            background: isMe ? theme.bubbleMe : theme.bubbleOther,
                                            color: isMe ? theme.bubbleMeText : theme.bubbleOtherText,
                                            padding: msg.fileUrl ? '16px' : '12px 18px',
                                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.04)',
                                            fontSize: '0.98rem',
                                            lineHeight: 1.5,
                                            position: 'relative',
                                            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }}>
                                            {msg.fileUrl ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ fontSize: '2rem' }}>
                                                            {msg.fileType?.includes('image') ? '🖼️' : '📄'}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {msg.fileName}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                                                {formatFileSize(msg.fileSize)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')}${msg.fileUrl}`}
                                                        download={msg.fileName}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.2)',
                                                            color: 'inherit',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            textAlign: 'center',
                                                            textDecoration: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        Descargar Archivo
                                                    </a>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            color: theme.textMuted,
                                            marginTop: '4px',
                                            fontWeight: 600,
                                            padding: '0 4px'
                                        }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '24px', background: theme.header, borderTop: `1px solid ${theme.border}`, zIndex: 10 }}>
                            <form
                                onSubmit={handleSend}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '8px',
                                    background: theme.inputBg,
                                    borderRadius: '20px',
                                    boxShadow: isDarkMode ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: uploading ? 0.5 : 1,
                                        color: theme.textMuted,
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = theme.accent}
                                    onMouseLeave={(e) => e.currentTarget.style.color = theme.textMuted}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    placeholder={uploading ? "Subiendo archivo..." : "Escribe un mensaje elegante..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={uploading}
                                    style={{
                                        flex: 1,
                                        padding: '12px 20px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        color: theme.text,
                                        fontSize: '0.95rem'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || uploading}
                                    style={{
                                        background: theme.bubbleMe,
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px 24px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        opacity: input.trim() ? 1 : 0.5,
                                        transform: input.trim() ? 'scale(1)' : 'scale(0.95)',
                                        boxShadow: input.trim() ? '0 8px 20px rgba(99, 102, 241, 0.3)' : 'none'
                                    }}
                                >
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.textMuted,
                        flexDirection: 'column',
                        gap: '24px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '6rem',
                            padding: '40px',
                            borderRadius: '40px',
                            background: theme.inputBg,
                            boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.05)'
                        }}>
                            ✨
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Tu Espacio de Comunicación</h3>
                            <p style={{ maxWidth: '300px', fontSize: '0.95rem', lineHeight: 1.6 }}>Minimalista, elegante y seguro. Selecciona un contacto para comenzar.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Expediente Digital / File Gallery Sidebar */}
            {showExpediente && (
                <div style={{
                    width: '300px',
                    background: theme.sidebar,
                    backdropFilter: 'blur(20px)',
                    borderLeft: `1px solid ${theme.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease'
                }}>
                    <div style={{ padding: '24px', borderBottom: `1px solid ${theme.border}` }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.text }}>Expediente Digital</h3>
                        <p style={{ fontSize: '0.75rem', color: theme.textMuted }}>Documentos compartidos</p>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {messages.filter(m => m.fileUrl).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textMuted }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
                                <p style={{ fontSize: '0.85rem' }}>Aún no hay documentos en este expediente.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {messages.filter(m => m.fileUrl).map(file => (
                                    <div key={file.id} style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: theme.inputBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{ fontSize: '1.5rem' }}>{file.fileType?.includes('image') ? '🖼️' : '📄'}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {file.fileName}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: theme.textMuted }}>
                                                {formatFileSize(file.fileSize)} · {new Date(file.createdAt).toLocaleDateString()}
                                            </div>
                                            <a
                                                href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')}${file.fileUrl}`}
                                                download={file.fileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.7rem', color: theme.accent, fontWeight: 700, textDecoration: 'none', display: 'block', marginTop: '4px' }}
                                            >
                                                Ver / Descargar
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
