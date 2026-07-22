'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export type ResourceType = 'NOTES' | 'PDF' | 'ROADMAP' | 'PLACEMENT_REPORT' | 'STUDY_MATERIAL';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string | null;
  externalUrl?: string | null;
  fileKey?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  tags: string[];
  collegeTag?: string | null;
  courseTag?: string | null;
  downloadCount: number;
  avgRating: number;
  ratingCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByMe?: boolean;
  createdAt: string;
  uploader: {
    id: string;
    profile?: { fullName: string; username?: string | null; avatarUrl?: string | null } | null;
  };
}

export interface ResourceComment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string | null } | null;
  };
}

export function useMyResourceBookmarks() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['resources', 'bookmarks'],
    queryFn: () => api.get<Resource[]>('/resources/bookmarks/me'),
    enabled: !!token,
  });
}

export function useRateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      api.post(`/resources/${id}/rate`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
}

export function useToggleResourceBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ bookmarked: boolean }>(`/resources/${id}/bookmark`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
}

export function useDownloadResource() {
  return useMutation({
    mutationFn: (id: string) =>
      api.get<{ url: string | null; configured: boolean }>(`/resources/${id}/download`),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
}

export function useToggleResourceLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ liked: boolean }>(`/resources/${id}/like`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
}

export function useResourceComments(id: string | null) {
  return useQuery({
    queryKey: ['resource-comments', id],
    queryFn: () => api.paginated<ResourceComment>(`/resources/${id}/comments?limit=50`),
    enabled: !!id,
  });
}

export function useAddResourceComment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<ResourceComment>(`/resources/${id}/comments`, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resource-comments', id] });
      qc.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useShareResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ shareCount: number }>(`/resources/${id}/share`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
}
