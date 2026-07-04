'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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

export function useResources(
  filters: { type?: string; q?: string; sort?: string; collegeId?: string; communityId?: string } = {},
) {
  return useInfiniteQuery({
    queryKey: ['resources', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '15' });
      if (filters.type) params.set('type', filters.type);
      if (filters.q) params.set('q', filters.q);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.collegeId) params.set('collegeId', filters.collegeId);
      if (filters.communityId) params.set('communityId', filters.communityId);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<Resource>(`/resources?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
    // Always fetch fresh on mount so newly-added resources appear immediately
    // (don't serve a stale/empty persisted list).
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useMyResourceBookmarks() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['resources', 'bookmarks'],
    queryFn: () => api.get<Resource[]>('/resources/bookmarks/me'),
    enabled: !!token,
  });
}

/**
 * Full upload flow: request a presigned URL, PUT the file to S3 (when configured),
 * then create the resource record. In dev (no S3) the PUT is skipped.
 */
export function useUploadResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      externalUrl: string;
      type: string;
      title: string;
      description?: string;
      tags?: string[];
      collegeId?: string;
      communityId?: string;
    }) =>
      api.post<Resource>('/resources', {
        type: input.type,
        title: input.title,
        description: input.description,
        externalUrl: input.externalUrl,
        tags: input.tags ?? [],
        collegeId: input.collegeId,
        communityId: input.communityId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
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
