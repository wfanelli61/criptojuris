'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { apiFetch } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

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
 sender: { id: string; name: string };
}

interface Conversation {
 id: string;
 participants: Array<{ id: string; name: string; role: string }>;
 updatedAt: string;
 messages: Message[];
}

function Avatar({ name, size = 40, gold = false }: { name: string; size?: number; gold?: boolean }) {
 const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
 return (
 <div style={{
 width: size, height: size, borderRadius: '50%', flexShrink: 0,
 background: gold ? 'linear-gradient(135deg, #C68A0A, #F0B429)' : 'linear-gradient(135deg, #0C2340, #1B4D8F)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: size * 0.35, fontWeight: 700,
 color: gold ? '#0C2340' : '#fff',
 }}>{initials}</div>
 );
}

function formatTime(date: string) {
 return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: string) {
 const d = new Date(date);
 const today = new Date();
 const yesterday = new Date(today);
 yesterday.setDate(yesterday.getDate() - 1);
 if (d.toDateString() === today.toDateString()) return 'Hoy';
 if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
 return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
}

function formatFileSize(bytes?: number) {
 if (!bytes) return '';
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function ChatPage() {
 const { user } = useAuth();
 const { socket, isConnected, sendMessage, joinConversation } = useSocket();
 const searchParams = useSearchParams();
 const convParam = searchParams.get('conv');

 const [conversations, setConversations] = useState<Conversation[]>([]);
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState('');
 const [loading, setLoading] = useState(true);
 const [uploading, setUploading] = useState(false);
 const [dark, setDark] = useState(true);
 const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

 const messagesEndRef = useRef<HTMLDivElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 const saved = localStorage.getItem('chat-dark');
 if (saved === '0') setDark(false);
 }, []);

 const toggleDark = () => setDark(d => {
 localStorage.setItem('chat-dark', !d ? '1' : '0');
 return !d;
 });

 useEffect(() => {
 apiFetch('/chat/conversations').then(data => {
 setConversations(data);
 if (convParam) setSelectedId(convParam);
 else if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
 }).catch(() => {}).finally(() => setLoading(false));
 }, []);

 useEffect(() => {
 if (!selectedId) return;
 apiFetch(`/chat/conversations/${selectedId}/messages`).then(data => {
 setMessages(data);
 joinConversation(selectedId);
 }).catch(() => {});
 }, [selectedId, joinConversation]);

 useEffect(() => {
 if (!socket) return;
 const handler = (msg: Message) => {
 if (msg.conversationId === selectedId) {
 setMessages(prev => [...prev, msg]);
 }
 setConversations(prev =>
 prev.map(c => c.id === msg.conversationId
 ? { ...c, updatedAt: msg.createdAt, messages: [msg] }
 : c
 ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
 );
 };
 socket.on('new_message', handler);
 return () => { socket.off('new_message', handler); };
 }, [socket, selectedId]);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 const handleSend = (e: React.SyntheticEvent) => {
 e.preventDefault();
 if (!input.trim() || !selectedId) return;
 sendMessage(selectedId, input.trim());
 setInput('');
 inputRef.current?.focus();
 };

 const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.currentTarget.files?.[0];
 if (!file || !selectedId) return;
 setUploading(true);
 const fd = new FormData();
 fd.append('file', file);
 try {
 const data = await apiFetch(`/chat/conversations/${selectedId}/upload`, { method: 'POST', body: fd });
 setMessages(prev => [...prev, data]);
 } catch { alert('Error al subir el archivo'); }
 finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
 };

 // ── Tema ──────────────────────────────────────────────────────────────────
 const t = {
 bg: dark ? '#0A0F1E' : '#F4F6FB',
 panel: dark ? '#0E1525' : '#FFFFFF',
 sidebar: dark ? '#0B1120' : '#FAFBFE',
 border: dark ? 'rgba(255,255,255,0.06)' : 'rgba(12,35,64,0.07)',
 text: dark ? '#EEF2FF' : '#0C2340',
 muted: dark ? '#6B7FA3' : '#8895AA',
 inputBg: dark ? '#131D33' : '#F0F2F8',
 bubbleMe: 'linear-gradient(135deg, #0C2340 0%, #1B4D8F 100%)',
 bubbleOther: dark ? '#141E33' : '#FFFFFF',
 textOther: dark ? '#EEF2FF' : '#0C2340',
 hover: dark ? 'rgba(255,255,255,0.04)' : 'rgba(12,35,64,0.04)',
 active: dark ? 'rgba(240,180,41,0.08)' : 'rgba(12,35,64,0.06)',
 activeBorder: dark ? 'rgba(240,180,41,0.25)' : 'rgba(12,35,64,0.15)',
 };

 if (loading) return (
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
 <div className="spinner" />
 </div>
 );

 const selectedConv = conversations.find(c => c.id === selectedId);
 const other = selectedConv?.participants.find(p => p.id !== user?.id) || selectedConv?.participants[0];

 // Agrupar mensajes por fecha
 const grouped: { date: string; msgs: Message[] }[] = [];
 messages.forEach(msg => {
 const date = formatDate(msg.createdAt);
 const last = grouped[grouped.length - 1];
 if (last?.date === date) last.msgs.push(msg);
 else grouped.push({ date, msgs: [msg] });
 });

 return (
 <>
 <style>{`
 .chat-layout { display: flex; height: calc(100vh - 4rem); }
 .chat-sidebar { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; }
 .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
 .chat-back-btn { display: none; }
 @media (max-width: 768px) {
   .chat-layout { height: calc(100vh - 60px); }
   .chat-sidebar { width: 100%; flex-shrink: unset; }
   .chat-sidebar.mobile-hidden { display: none; }
   .chat-area.mobile-hidden { display: none; }
   .chat-back-btn { display: flex; }
 }
 `}</style>
 <div className="chat-layout" style={{
 background: t.bg, borderRadius: '1.25rem', overflow: 'hidden',
 border: `1px solid ${t.border}`,
 boxShadow: dark ? '0 32px 64px rgba(0,0,0,0.4)' : '0 8px 32px rgba(12,35,64,0.08)',
 }}>

 {/* ── Sidebar ─────────────────────────────────────────────────── */}
 <div className={`chat-sidebar${mobileView === 'chat' ? ' mobile-hidden' : ''}`} style={{
 background: t.sidebar, borderRight: `1px solid ${t.border}`,
 }}>
 {/* Header sidebar */}
 <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div>
 <div style={{ fontSize: '1.1rem', fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>Mensajes</div>
 <div style={{ fontSize: '0.72rem', color: t.muted, marginTop: '1px' }}>
 {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
 </div>
 </div>
 <button onClick={toggleDark} style={{
 width: '32px', height: '32px', borderRadius: '8px',
 background: t.inputBg, border: 'none', cursor: 'pointer',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '0.9rem', color: t.muted, transition: 'all 0.2s',
 }}
 onMouseEnter={e => (e.currentTarget.style.color = t.text)}
 onMouseLeave={e => (e.currentTarget.style.color = t.muted)}
 >{dark ? '☀️' : '🌙'}</button>
 </div>

 {/* Lista conversaciones */}
 <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.75rem' }}>
 {conversations.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '3rem 1rem', color: t.muted, fontSize: '0.85rem' }}>
 <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}></div>
 Sin conversaciones aún
 </div>
 ) : conversations.map(conv => {
 const o = conv.participants.find(p => p.id !== user?.id) || conv.participants[0];
 const active = selectedId === conv.id;
 const lastMsg = conv.messages[0];
 return (
 <div key={conv.id} onClick={() => { setSelectedId(conv.id); setMobileView('chat'); }} style={{
 display: 'flex', alignItems: 'center', gap: '0.75rem',
 padding: '0.65rem 0.75rem', borderRadius: '0.75rem', marginBottom: '2px',
 cursor: 'pointer', transition: 'all 0.15s',
 background: active ? t.active : 'transparent',
 border: `1px solid ${active ? t.activeBorder : 'transparent'}`,
 }}
 onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.hover; }}
 onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
 >
 <Avatar name={o?.name || '?'} size={40} gold={active} />
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, fontSize: '0.88rem', color: t.text, marginBottom: '2px' }}>{o?.name}</div>
 <div style={{ fontSize: '0.75rem', color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
 {lastMsg?.fileUrl ? '📎 Archivo' : lastMsg?.content || 'Iniciá la conversación'}
 </div>
 </div>
 <div style={{ fontSize: '0.65rem', color: t.muted, flexShrink: 0 }}>
 {formatTime(conv.updatedAt)}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* ── Área de chat ─────────────────────────────────────────────── */}
 <div className={`chat-area${mobileView === 'list' ? ' mobile-hidden' : ''}`} style={{ background: t.panel }}>

 {selectedId && other ? (<>
 {/* Header */}
 <div style={{
 padding: '1rem 1.5rem', borderBottom: `1px solid ${t.border}`,
 display: 'flex', alignItems: 'center', gap: '0.75rem',
 }}>
 <button className="chat-back-btn" onClick={() => setMobileView('list')} style={{
 alignItems: 'center', justifyContent: 'center',
 width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
 background: t.inputBg, border: 'none', cursor: 'pointer', color: t.text,
 }}>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
 <polyline points="15 18 9 12 15 6" />
 </svg>
 </button>
 <Avatar name={other.name} size={38} />
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 600, color: t.text, fontSize: '0.92rem' }}>{other.name}</div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#10B981' : t.muted }} />
 <span style={{ fontSize: '0.7rem', color: t.muted }}>
 {isConnected ? 'En línea' : 'Desconectado'}
 </span>
 </div>
 </div>
 </div>

 {/* Mensajes */}
 <div style={{
 flex: 1, overflowY: 'auto', padding: '1.5rem',
 display: 'flex', flexDirection: 'column', gap: '0.25rem',
 }}>
 {grouped.map(group => (
 <div key={group.date}>
 {/* Separador de fecha */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0 0.75rem' }}>
 <div style={{ flex: 1, height: '1px', background: t.border }} />
 <span style={{ fontSize: '0.68rem', color: t.muted, fontWeight: 600, padding: '0.2rem 0.6rem', background: t.inputBg, borderRadius: '9999px' }}>
 {group.date}
 </span>
 <div style={{ flex: 1, height: '1px', background: t.border }} />
 </div>

 {group.msgs.map((msg, idx) => {
 const isMe = msg.senderId === user?.id;
 const prev = group.msgs[idx - 1];
 const next = group.msgs[idx + 1];
 const sameAsPrev = prev?.senderId === msg.senderId;
 const sameAsNext = next?.senderId === msg.senderId;

 const radius = isMe
 ? `1.1rem 1.1rem ${sameAsNext ? '0.35rem' : '1.1rem'} 1.1rem`
 : `1.1rem 1.1rem 1.1rem ${sameAsNext ? '0.35rem' : '1.1rem'}`;

 return (
 <div key={msg.id} style={{
 display: 'flex', flexDirection: 'column',
 alignItems: isMe ? 'flex-end' : 'flex-start',
 marginTop: sameAsPrev ? '2px' : '0.75rem',
 }}>
 <div style={{
 maxWidth: '68%',
 background: isMe ? t.bubbleMe : t.bubbleOther,
 color: isMe ? '#fff' : t.textOther,
 padding: msg.fileUrl ? '0.75rem 1rem' : '0.6rem 1rem',
 borderRadius: radius,
 fontSize: '0.9rem', lineHeight: 1.55,
 boxShadow: isMe
 ? '0 2px 8px rgba(12,35,64,0.25)'
 : dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(12,35,64,0.07)',
 border: !isMe && !dark ? `1px solid ${t.border}` : 'none',
 }}>
 {msg.fileUrl ? (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
 <div style={{
 width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
 background: isMe ? 'rgba(255,255,255,0.15)' : t.inputBg,
 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
 }}>
 {msg.fileType?.includes('image') ? '🖼️' : ''}
 </div>
 <div style={{ minWidth: 0 }}>
 <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
 {msg.fileName}
 </div>
 <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{formatFileSize(msg.fileSize)}</div>
 </div>
 </div>
 <a href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')}${msg.fileUrl}`}
 download={msg.fileName} target="_blank" rel="noreferrer"
 style={{
 display: 'block', textAlign: 'center', padding: '0.4rem',
 background: isMe ? 'rgba(255,255,255,0.12)' : t.inputBg,
 borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
 color: isMe ? '#fff' : t.text, textDecoration: 'none',
 }}>
 Descargar
 </a>
 </div>
 ) : msg.content}
 </div>
 {/* Hora — solo en el último de la cadena */}
 {!sameAsNext && (
 <div style={{ fontSize: '0.62rem', color: t.muted, margin: '3px 4px 0', fontWeight: 500 }}>
 {formatTime(msg.createdAt)}
 </div>
 )}
 </div>
 );
 })}
 </div>
 ))}
 {messages.length === 0 && (
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: t.muted, padding: '3rem' }}>
 <div style={{ fontSize: '2.5rem', opacity: 0.4 }}></div>
 <div style={{ fontSize: '0.85rem' }}>Enviá el primer mensaje</div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input */}
 <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${t.border}` }}>
 <form onSubmit={handleSend} style={{
 display: 'flex', alignItems: 'center', gap: '0.5rem',
 background: t.inputBg, borderRadius: '0.875rem', padding: '0.4rem 0.4rem 0.4rem 1rem',
 border: `1px solid ${t.border}`,
 }}>
 <input type="file" ref={fileInputRef} onChange={handleFile} style={{ display: 'none' }} />

 {/* Clip */}
 <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
 background: 'none', border: 'none', padding: '0.35rem',
 cursor: uploading ? 'not-allowed' : 'pointer', color: t.muted,
 display: 'flex', borderRadius: '6px', transition: 'color 0.15s, background 0.15s',
 opacity: uploading ? 0.5 : 1,
 }}
 onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.background = t.hover; }}
 onMouseLeave={e => { e.currentTarget.style.color = t.muted; e.currentTarget.style.background = 'none'; }}
 >
 <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
 </svg>
 </button>

 <input ref={inputRef} type="text"
 placeholder={uploading ? 'Subiendo...' : 'Escribí un mensaje...'}
 value={input} onChange={e => setInput(e.target.value)}
 disabled={uploading}
 style={{
 flex: 1, background: 'none', border: 'none', outline: 'none',
 color: t.text, fontSize: '0.9rem', padding: '0.35rem 0',
 }}
 />

 {/* Enviar */}
 <button type="submit" disabled={!input.trim() || uploading} style={{
 width: '36px', height: '36px', borderRadius: '0.6rem', flexShrink: 0,
 background: input.trim() ? 'linear-gradient(135deg, #0C2340, #1B4D8F)' : t.border,
 border: 'none', cursor: input.trim() ? 'pointer' : 'default',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 transition: 'all 0.2s',
 boxShadow: input.trim() ? '0 4px 12px rgba(12,35,64,0.3)' : 'none',
 }}>
 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : t.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
 <line x1="22" y1="2" x2="11" y2="13" />
 <polygon points="22 2 15 22 11 13 2 9 22 2" />
 </svg>
 </button>
 </form>
 </div>
 </>) : (
 /* Empty state */
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: t.muted }}>
 <div style={{
 width: '64px', height: '64px', borderRadius: '1rem',
 background: t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '1.75rem',
 }}></div>
 <div style={{ textAlign: 'center' }}>
 <div style={{ fontWeight: 600, color: t.text, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
 Comunicación legal segura
 </div>
 <div style={{ fontSize: '0.82rem', maxWidth: '220px', lineHeight: 1.6 }}>
 Seleccioná una conversación para comenzar
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </>
 );
}
