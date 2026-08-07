const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchWrapper<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore if not JSON
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => fetchWrapper<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: any) =>
    fetchWrapper<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any) =>
    fetchWrapper<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => fetchWrapper<T>(endpoint, { method: 'DELETE' }),
};
