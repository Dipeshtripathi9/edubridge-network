'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface Post {
  id: string;
  type: 'TEXT' | 'POLL' | 'RESOURCE' | 'LINK';
  kind?: string;
  isPinned?: boolean;
  title?: string | null;
  body: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  createdAt: string;
  linkUrl?: string | null;
  poll?: { id: string; question: string; multiple: boolean; options: PollOption[] } | null;
  author: {
    id: string;
    reputationPoints?: number;
    profile?: {
      fullName: string;
      username?: string | null;
      avatarUrl?: string | null;
      collegeVerification?: string | null;
      college?: { name: string } | null;
    } | null;
  };
}

export function useFeed(slug: string, section?: 'ANNOUNCEMENTS' | 'DISCUSSION' | 'POLLS') {
  return useInfiniteQuery({
    queryKey: ['feed', slug, section ?? 'all'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '15' });
      if (section) params.set('section', section);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<Post>(`/communities/${slug}/posts?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
    enabled: !!slug,
  });
}

export function useSharePost(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.post<{ shared: boolean }>(`/posts/${postId}/share`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed', slug] }),
  });
}

export function useMySavedPosts() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['saved-posts'],
    queryFn: () => api.get<(Post & { community?: { slug: string; name: string } })[]>('/posts/bookmarks/me'),
    enabled: !!token,
  });
}

export function useCreatePost(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      api.post<Post>(`/communities/${slug}/posts`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed', slug] }),
  });
}

export function useToggleLike(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.post<{ liked: boolean }>(`/posts/${postId}/like`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed', slug] });
      qc.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });
}

export function usePinPost(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.post<{ isPinned: boolean }>(`/posts/${postId}/pin`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed', slug] }),
  });
}

export function useDeletePost(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.delete(`/posts/${postId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed', slug] }),
  });
}

export function useToggleBookmark(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.post<{ saved: boolean }>(`/posts/${postId}/bookmark`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed', slug] });
      qc.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });
}

export function useVotePoll(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { postId: string; optionIds: string[] }) =>
      api.post(`/posts/${input.postId}/poll/vote`, { optionIds: input.optionIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed', slug] }),
  });
}

export interface Comment {
  id: string;
  body: string;
  likeCount: number;
  isHelpful: boolean;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      collegeVerification?: string | null;
      college?: { name: string } | null;
    } | null;
  };
  replies?: Comment[];
}

export function useComments(postId: string | null) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api.paginated<Comment>(`/posts/${postId}/comments?limit=50`),
    enabled: !!postId,
  });
}

export function useAddComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; parentId?: string }) =>
      api.post<Comment>(`/posts/${postId}/comments`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      // Also refresh feeds so the post card's commentCount updates right away
      // (['feed'] prefix-matches every ['feed', slug, section] query).
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
