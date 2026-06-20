'use client';

import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

/** Lazily create (or return) the authenticated Socket.IO connection. */
export function getSocket(): Socket | null {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(`${WS_URL}/ws`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });
  } else {
    socket.auth = { token };
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
