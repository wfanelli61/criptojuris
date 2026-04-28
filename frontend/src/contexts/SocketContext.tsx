'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken, apiFetch } from '@/lib/api';

export interface AppNotification {
    id: string;
    title: string;
    body?: string;
    type: string;
    link?: string;
    refId?: string;
    read: boolean;
    createdAt: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    clearUnread: () => void;
    notifications: AppNotification[];
    notifUnread: number;
    markNotifRead: (id: string) => void;
    markAllRead: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const notifUnread = notifications.filter(n => !n.read).length;

    const clearUnread = useCallback(() => setUnreadCount(0), []);

    const markNotifRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try { await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }); } catch {}
    }, []);

    const markAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try { await apiFetch('/notifications/read-all', { method: 'PATCH' }); } catch {}
    }, []);

    // Cargar notificaciones iniciales
    useEffect(() => {
        if (!user) return;
        apiFetch('/notifications')
            .then(d => setNotifications(d.notifications || []))
            .catch(() => {});
    }, [user]);

    useEffect(() => {
        if (!user) {
            if (socket) { socket.disconnect(); setSocket(null); }
            return;
        }

        const token = getAccessToken();
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        // Mensajes de chat
        newSocket.on('new_message', (message: any) => {
            if (message.senderId !== user.id) {
                setUnreadCount(prev => prev + 1);
            }
        });

        // Notificaciones del sistema
        newSocket.on('notification', (notif: AppNotification) => {
            setNotifications(prev => [notif, ...prev.slice(0, 29)]);
        });

        // Borrar notificaciones cuando otro abogado tomó el caso
        newSocket.on('notification_remove', ({ refId }: { refId: string }) => {
            setNotifications(prev => prev.filter(n => n.refId !== refId));
        });

        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadCount, clearUnread, notifications, notifUnread, markNotifRead, markAllRead }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useGlobalSocket() {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useGlobalSocket must be used within a SocketProvider');
    return context;
}
