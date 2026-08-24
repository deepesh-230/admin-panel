import { apiClient } from '../utils/apiClient';

export type CmsRecord = Record<string, unknown> & { id: string };

export function cmsApi(basePath: string) {
  return {
    getAll: (search?: string, extra?: Record<string, string>) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (extra) {
        Object.entries(extra).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });
      }
      const q = params.toString() ? `?${params.toString()}` : '';
      return apiClient.get<CmsRecord[]>(`/api/v1/${basePath}${q}`);
    },
    create: (data: Record<string, unknown>) =>
      apiClient.post<CmsRecord>(`/api/v1/${basePath}`, data),
    update: (id: string, data: Record<string, unknown>) =>
      apiClient.patch<CmsRecord>(`/api/v1/${basePath}/${id}`, data),
    remove: (id: string) => apiClient.delete<void>(`/api/v1/${basePath}/${id}`),
    broadcast: (id: string) =>
      apiClient.patch<CmsRecord>(`/api/v1/${basePath}/${id}/broadcast`, {}),
  };
}
