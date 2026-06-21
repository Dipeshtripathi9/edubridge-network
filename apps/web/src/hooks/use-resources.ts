'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ResourceType = 'NOTES' | 'PDF' | 'ROADMAP' | 'PLACEMENT_REPORT' | 'STUDY_MATERIAL';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string | null;
  fileKey: string;
  fileSize?: number | null;
  mimeType?: string | null;
  tags: string[];
  collegeTag?: string | null;
  courseTag?: string | null;
  downloadCount: number;
  avgRating: number;
  ratingCount: number;
  createdAt: string;
  uploader: {
    id: string;
    profile?: { fullName: string; username?: string | null; avatarUrl?: string | null } | null;
  };
}

export function useResources(
  filters: { type?: string; q?: string; sort?: string; collegeId?: string } = {},
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
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<Resource>(`/resources?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useMyResourceBookmarks() {
  return useQuery({
    queryKey: ['resources', 'bookmarks'],
    queryFn: () => api.get<Resource[]>('/resources/bookmarks/me'),
  });
}

interface UploadUrlResult {
  uploadUrl: string | null;
  key: string;
  configured: boolean;
}

/**
 * Full upload flow: request a presigned URL, PUT the file to S3 (when configured),
 * then create the resource record. In dev (no S3) the PUT is skipped.
 */
export function useUploadResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      type: string;
      title: string;
      description?: string;
      tags?: string[];
      collegeId?: string;
    }) => {
      const presign = await api.post<UploadUrlResult>('/resources/upload-url', {
        fileName: input.file.name,
        contentType: input.file.type || 'application/octet-stream',
      });
      if (presign.uploadUrl) {
        await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': input.file.type || 'application/octet-stream' },
          body: input.file,
        });
      }
      return api.post<Resource>('/resources', {
        type: input.type,
        title: input.title,
        description: input.description,
        fileKey: presign.key,
        fileSize: input.file.size,
        mimeType: input.file.type,
        tags: input.tags ?? [],
        collegeId: input.collegeId,
      });
    },
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
    mutationFn: (id: string) => api.get<{ url: string; configured: boolean }>(`/resources/${id}/download`),
  });
}
