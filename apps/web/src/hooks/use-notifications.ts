'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: { postId?: string; chatId?: string; link?: string } | null;
  isRead: boolean;
  createdAt: string;
  transient?: boolean;
}

export function useUnreadCount() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    enabled: !!token,
    refetchInterval: 60_000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => api.paginated<Notification>('/notifications?limit=30'),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

/**
 * Subscribe to real-time notifications. Mount once (in the app shell): toasts
 * incoming notifications and refreshes the unread count / list.
 */
export function useNotificationStream() {
  const qc = useQueryClient();
  // Re-run when auth changes: the app shell mounts this for guests too (socket
  // is null then), so without `token` in the deps a user who logs in mid-session
  // would get no live notifications until a full page reload.
  const token = useAuthStore((s) => s.accessToken);
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNew = (n: Notification) => {
      toast(n.title, { description: n.body ?? undefined });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    };
    const onRefresh = () => qc.invalidateQueries({ queryKey: ['notifications'] });

    socket.on('notification:new', onNew);
    socket.on('notifications:refresh', onRefresh);
    return () => {
      socket.off('notification:new', onNew);
      socket.off('notifications:refresh', onRefresh);
    };
  }, [qc, token]);
}
