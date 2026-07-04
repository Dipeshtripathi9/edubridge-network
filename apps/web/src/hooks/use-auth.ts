'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/stores/auth.store';

interface AuthResult {
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  user: AuthUser;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (input: { email: string; password: string; rememberMe?: boolean }) =>
      api.post<AuthResult>('/auth/login', input, { auth: false }),
    onSuccess: (res) => {
      setSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      router.push('/home');
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; fullName: string; gender?: string }) =>
      api.post<{ user: AuthUser; autoVerified: boolean; message: string; devLink?: string }>(
        '/auth/signup',
        input,
        { auth: false },
      ),
  });
}

export function useVerifyEmail() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (token: string) => api.post<AuthResult>('/auth/verify-email', { token }, { auth: false }),
    // Verifying the email activates the account AND signs the user in — they go
    // straight to onboarding, never back to a manual login screen.
    onSuccess: (res) => {
      setSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      router.push('/onboarding');
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ message: string; devLink?: string }>('/auth/resend-verification', { email }, { auth: false }),
  });
}

export function useGoogleAuth() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (idToken: string) =>
      api.post<AuthResult>('/auth/google', { idToken }, { auth: false }),
    onSuccess: (res) => {
      setSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      router.push('/home');
    },
  });
}

export function useRequestMagicLink() {
  return useMutation({
    mutationFn: (input: { email: string; fullName?: string }) =>
      api.post<{ message: string; devLink?: string }>('/auth/magic/request', input, { auth: false }),
  });
}

export function useVerifyMagicLink() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (token: string) =>
      api.post<AuthResult>('/auth/magic/verify', { token }, { auth: false }),
    onSuccess: (res) => {
      setSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      router.push('/home');
    },
  });
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: (phone: string) => api.post('/auth/otp/request', { phone }, { auth: false }),
  });
}

export function useVerifyOtp() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (input: { phone: string; code: string }) =>
      api.post<AuthResult>('/auth/otp/verify', input, { auth: false }),
    onSuccess: (res) => {
      setSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      router.push('/onboarding');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  return async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    router.push('/login');
  };
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.post('/auth/forgot-password', { email }, { auth: false }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      api.post('/auth/reset-password', input, { auth: false }),
  });
}
