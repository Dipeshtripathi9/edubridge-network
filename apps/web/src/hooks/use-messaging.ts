'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';

export interface ChatSummary {
  id: string;
  type: 'DIRECT';
  title?: string | null;
  other?: { id: string; profile?: { fullName: string; avatarUrl?: string | null } | null } | null;
  otherOnline: boolean;
  lastMessage?: { body: string; createdAt: string } | null;
  lastMessageAt?: string | null;
  unread: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender?: { id: string; profile?: { fullName: string; avatarUrl?: string | null } | null };
}

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => api.get<ChatSummary[]>('/chats'),
    refetchInterval: 20_000,
  });
}

export function useMessages(chatId: string | null) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const res = await api.paginated<ChatMessage>(`/chats/${chatId}/messages?limit=50`);
      return res.data.reverse(); // oldest first for display
    },
    enabled: !!chatId,
  });
}

/**
 * Live conversation: joins the chat room, appends incoming messages, exposes
 * send/typing/read and the other party's typing state.
 */
export function useChatSocket(chatId: string | null) {
  const qc = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket || !chatId) return;

    socket.emit('chat:join', { chatId });
    socket.emit('message:read', { chatId });

    const onNew = (msg: ChatMessage) => {
      if (msg.chatId !== chatId) return;
      qc.setQueryData<ChatMessage[]>(['messages', chatId], (old = []) =>
        old.some((m) => m.id === msg.id) ? old : [...old, msg],
      );
    };
    const onTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId !== chatId) return;
      setTypingUsers((prev) =>
        data.isTyping ? [...new Set([...prev, data.userId])] : prev.filter((u) => u !== data.userId),
      );
    };
    const onChatUpdated = () => qc.invalidateQueries({ queryKey: ['chats'] });

    socket.on('message:new', onNew);
    socket.on('typing', onTyping);
    socket.on('chat:updated', onChatUpdated);

    return () => {
      socket.emit('chat:leave', { chatId });
      socket.off('message:new', onNew);
      socket.off('typing', onTyping);
      socket.off('chat:updated', onChatUpdated);
    };
  }, [chatId, qc]);

  const send = (body: string) => {
    const socket = socketRef.current;
    if (socket && chatId) socket.emit('message:send', { chatId, body });
  };
  const setTyping = (isTyping: boolean) => {
    const socket = socketRef.current;
    if (socket && chatId) socket.emit('typing', { chatId, isTyping });
  };

  return { send, setTyping, typingUsers };
}

export async function openDirectChat(userId: string): Promise<{ id: string }> {
  return api.post<{ id: string }>('/chats/direct', { userId });
}

/**
 * Reliable REST send (the endpoint also broadcasts over WS to other viewers).
 * Used where we can't depend on the socket already being connected (e.g. pools).
 */
export function useSendMessage(chatId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<ChatMessage>(`/chats/${chatId}/messages`, { body }),
    onSuccess: (msg) =>
      qc.setQueryData<ChatMessage[]>(['messages', chatId], (old = []) =>
        old.some((m) => m.id === msg.id) ? old : [...old, msg],
      ),
  });
}

/** Presence updates across the app (online/offline dots). */
export function usePresence() {
  const [online, setOnline] = useState<Record<string, boolean>>({});
  // Re-subscribe when auth changes so presence starts working right after login
  // (not only after a full reload).
  const token = useAuthStore((s) => s.accessToken);
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (d: { userId: string; online: boolean }) =>
      setOnline((prev) => ({ ...prev, [d.userId]: d.online }));
    socket.on('presence:update', handler);
    return () => {
      socket.off('presence:update', handler);
    };
  }, [token]);
  return online;
}
