'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

const SOCKET_URL = 'http://localhost:4000'; // Debería coincidir con el puerto del backend

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Conectado al servidor de chat');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Desconectado del servidor de chat');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = useCallback((conversationId: string, content: string) => {
        if (socket && isConnected) {
            socket.emit('send_message', { conversationId, content });
        }
    }, [socket, isConnected]);

    const joinConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('join_conversation', conversationId);
        }
    }, [socket, isConnected]);

    return {
        socket,
        isConnected,
        sendMessage,
        joinConversation
    };
}
