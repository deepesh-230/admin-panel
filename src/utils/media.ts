const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export function resolveMediaUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const url = value.trim();
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
