const ACCESS_TOKEN_KEY = 'dd_access_token';
const REFRESH_TOKEN_KEY = 'dd_refresh_token';
const USER_KEY = 'dd_auth_user';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  isActive: boolean;
  stateId?: string | null;
  role: string;
  permissions: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: { code: string };
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeSession(user: AuthUser, tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      `HTTP Error ${response.status}`;
    throw new Error(message);
  }

  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }

  return json as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = getAccessToken();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiRequest<T>(endpoint, options, false);
    }
    clearSession();
  }

  return parseResponse<T>(response);
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const data = await apiRequest<AuthTokens>(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      false,
    );

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  /** Multipart upload — do not set Content-Type (browser sets boundary). */
  upload: async <T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> => {
    const form = new FormData();
    form.append(fieldName, file);
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = new Headers();
    const accessToken = getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(url, { method: 'POST', headers, body: form });

    if (response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const retryHeaders = new Headers();
        const token = getAccessToken();
        if (token) retryHeaders.set('Authorization', `Bearer ${token}`);
        const retry = await fetch(url, { method: 'POST', headers: retryHeaders, body: form });
        return parseResponse<T>(retry);
      }
      clearSession();
    }

    return parseResponse<T>(response);
  },
};
