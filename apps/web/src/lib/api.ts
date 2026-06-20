'use client';

import { useAuthStore } from '@/stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      logout();
      return null;
    }
    const json = await res.json();
    const tokens = json.data as { accessToken: string; refreshToken: string };
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    logout();
    return null;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && auth && retry) {
    refreshPromise ??= doRefresh().finally(() => {
      refreshPromise = null;
    });
    const newToken = await refreshPromise;
    if (newToken) return request<T>(path, options, false);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const message = Array.isArray(json.message) ? json.message.join(', ') : json.message;
    throw new ApiError(res.status, message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

/** For paginated endpoints — returns both data and meta. */
async function requestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T[]; meta: { hasMore: boolean; nextCursor?: string | null; page: number } }> {
  const token = useAuthStore.getState().accessToken;
  const { auth = true, headers } = options;
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message ?? 'Request failed');
  return { data: json.data ?? [], meta: json.meta ?? { hasMore: false, page: 1 } };
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
  paginated: requestPaginated,
};
