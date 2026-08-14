import { apiClient } from '../utils/apiClient';

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  stateId: string | null;
  role: string;
  state?: { id: string; name: string; code: string | null } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UsersListResponse = {
  items: AppUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const usersApi = {
  getAll: (params: Record<string, string | number | undefined> = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') sp.set(key, String(value));
    });
    const q = sp.toString() ? `?${sp}` : '';
    return apiClient.get<UsersListResponse>(`/api/v1/users${q}`);
  },
  getOne: (id: string) => apiClient.get<AppUser>(`/api/v1/users/${id}`),
  create: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: string;
    stateId?: string;
    isActive?: boolean;
  }) => apiClient.post<AppUser>('/api/v1/users', data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      role: string;
      stateId: string | null;
      isActive: boolean;
      password: string;
    }>,
  ) => apiClient.patch<AppUser>(`/api/v1/users/${id}`, data),
  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<AppUser>(`/api/v1/users/${id}/status`, { isActive }),
  remove: (id: string) => apiClient.delete<{ id: string; deleted: boolean }>(`/api/v1/users/${id}`),
};
