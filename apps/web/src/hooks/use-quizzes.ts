'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export interface QuizQuestionAdmin {
  id: string;
  quizId: string;
  order: number;
  prompt: string;
  options: string[];
  correctOption: number;
  createdAt: string;
}

export interface QuizQuestionForTaking {
  id: string;
  prompt: string;
  options: string[];
}

export interface QuizAdmin {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestionAdmin[];
  _count?: { questions: number; attempts: number };
}

export interface QuizForTaking {
  id: string;
  title: string;
  description?: string | null;
  questions: QuizQuestionForTaking[];
}

export interface QuizPublishedListItem {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  createdAt: string;
  _count: { questions: number };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

// ---------------- Admin ----------------

export function useAdminQuizzes() {
  return useQuery({
    queryKey: ['quizzes', 'admin'],
    queryFn: () => api.get<QuizAdmin[]>('/quizzes'),
  });
}

export function useAdminQuiz(id: string | undefined) {
  return useQuery({
    queryKey: ['quizzes', 'admin', id],
    queryFn: () => api.get<QuizAdmin>(`/quizzes/${id}`),
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string }) => api.post<QuizAdmin>('/quizzes', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quizzes', 'admin'] }),
  });
}

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      title?: string;
      description?: string;
      isPublished?: boolean;
    }) => api.patch<QuizAdmin>(`/quizzes/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quizzes', 'admin'] }),
  });
}

export function useAddQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      ...input
    }: {
      quizId: string;
      prompt: string;
      options: string[];
      correctOption: number;
    }) => api.post<QuizQuestionAdmin>(`/quizzes/${quizId}/questions`, input),
    onSuccess: (_, { quizId }) => qc.invalidateQueries({ queryKey: ['quizzes', 'admin', quizId] }),
  });
}

export function useDeleteQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      api.delete<{ id: string }>(`/quizzes/${quizId}/questions/${questionId}`),
    onSuccess: (_, { quizId }) => qc.invalidateQueries({ queryKey: ['quizzes', 'admin', quizId] }),
  });
}

// ---------------- Student ----------------

export function usePublishedQuizzes() {
  return useQuery({
    queryKey: ['quizzes', 'published'],
    queryFn: () => api.get<QuizPublishedListItem[]>('/quizzes/published/list', { auth: false }),
  });
}

export function useQuizForTaking(id: string | undefined) {
  return useQuery({
    queryKey: ['quizzes', 'take', id],
    queryFn: () => api.get<QuizForTaking>(`/quizzes/${id}/take`, { auth: false }),
    enabled: !!id,
  });
}

export function useSubmitQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Record<string, number> }) =>
      api.post<QuizAttempt>(`/quizzes/${quizId}/attempts`, { answers }),
    onSuccess: (_, { quizId }) => qc.invalidateQueries({ queryKey: ['quizzes', 'attempts', quizId] }),
  });
}

export function useMyQuizAttempts(quizId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['quizzes', 'attempts', quizId],
    queryFn: () => api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts/me`),
    enabled: !!token && !!quizId,
  });
}
