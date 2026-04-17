'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '@/lib/api';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    notifications: any[];
    clearUnread: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);

    const clearUnread = useCallback(() => {
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const token = getAccessToken();
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket conectado globalmente');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket desconectado globalmente');
        });

        newSocket.on('new_message', (message: any) => {
            // Incrementar contador si el remitente no es el usuario actual
            if (message.senderId !== user.id) {
                setUnreadCount(prev => prev + 1);

                // Añadir a notificaciones visuales temporales
                const newNotif = {
                    id: Date.now(),
                    message: `Nuevo mensaje de ${message.sender?.name || 'un usuario'}`,
                    type: 'message'
                };
                setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);

                // Mostrar alerta sonora básica si es posible o simplemente el toast visual
                console.log('Notificación recibida:', message);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadCount, notifications, clearUnread }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useGlobalSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useGlobalSocket must be used within a SocketProvider');
    }
    return context;
}
