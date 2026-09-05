import { apiClient } from '../utils/apiClient';

export type AdminLifecycleFlag = 'READ' | 'ACTIVE' | 'DELETE';

export type DashboardEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  adminFlag?: AdminLifecycleFlag;
  createdAt?: string;
};

export const dashboardApi = {
  getStats: (params?: { from?: string; to?: string }) => {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const q = query.toString();
    return apiClient.get<Record<string, unknown>>(`/api/v1/dashboard/stats${q ? `?${q}` : ''}`);
  },

  setFlag: (entity: string, id: string, flag: AdminLifecycleFlag) =>
    apiClient.patch<Record<string, unknown>>('/api/v1/dashboard/flag', { entity, id, flag }),

  listEvents: (params?: { from?: string; to?: string }) => {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const q = query.toString();
    return apiClient.get<DashboardEvent[]>(`/api/v1/dashboard/events${q ? `?${q}` : ''}`);
  },

  createEvent: (data: {
    title: string;
    description?: string;
    location?: string;
    startsAt: string;
    endsAt?: string;
  }) => apiClient.post<DashboardEvent>('/api/v1/dashboard/events', data),

  updateEvent: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<DashboardEvent>(`/api/v1/dashboard/events/${id}`, data),

  removeEvent: (id: string) => apiClient.delete<void>(`/api/v1/dashboard/events/${id}`),

  purgeDeleted: () => apiClient.post<Record<string, unknown>>('/api/v1/dashboard/purge-deleted', {}),

  backfill: () => apiClient.post<Record<string, unknown>>('/api/v1/dashboard/backfill', {}),
};
