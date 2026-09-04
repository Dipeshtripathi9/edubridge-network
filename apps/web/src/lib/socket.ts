'use client';

import type { Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Lazily create (or return) the authenticated Socket.IO connection.
 * socket.io-client is dynamically imported here (not a top-level import) so
 * pages that never touch chat or notifications don't pay for its ~30-40KB in
 * their shared bundle — only the code paths that actually call this do.
 */
export async function getSocket(): Promise<Socket | null> {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  if (socket && socket.connected) return socket;

  const { io } = await import('socket.io-client');

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
