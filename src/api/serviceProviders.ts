import { apiClient } from '../utils/apiClient';

export type ProviderApprovalStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type ProviderAdmin = {
  id: string;
  userId: string;
  isPrimary: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    isActive: boolean;
    role: string;
  };
  createdAt?: string;
};

export type ServiceProvider = {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string | null;
  description: string | null;
  phone: string | null;
  landline: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  stateId: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  about: string | null;
  services: string | null;
  coverPhotoUrl: string | null;
  gallery: string[];
  isActive: boolean;
  approvalStatus: ProviderApprovalStatus;
  rejectedReason: string | null;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string; categoryId: string } | null;
  state?: { id: string; name: string; code: string | null } | null;
  admins?: ProviderAdmin[];
  adminCount?: number;
  approvedAt?: string | null;
  distanceKm?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceProvidersListResponse = {
  items: ServiceProvider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProviderPayload = {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  phone?: string;
  landline?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  stateId: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  about?: string;
  services?: string;
  coverPhotoUrl?: string;
  gallery?: string[];
  isActive?: boolean;
  approvalStatus?: ProviderApprovalStatus;
};

export const serviceProvidersApi = {
  getAll: (params: Record<string, string | number | undefined> = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') sp.set(key, String(value));
    });
    const q = sp.toString() ? `?${sp}` : '';
    return apiClient.get<ServiceProvidersListResponse>(`/api/v1/service-providers${q}`);
  },
  getOne: (id: string) => apiClient.get<ServiceProvider>(`/api/v1/service-providers/${id}`),
  create: (data: ProviderPayload) =>
    apiClient.post<ServiceProvider>('/api/v1/service-providers', data),
  update: (id: string, data: Partial<ProviderPayload>) =>
    apiClient.patch<ServiceProvider>(`/api/v1/service-providers/${id}`, data),
  remove: (id: string) =>
    apiClient.delete<{ id: string; deleted: boolean }>(`/api/v1/service-providers/${id}`),
  approve: (id: string) =>
    apiClient.post<ServiceProvider>(`/api/v1/service-providers/${id}/approve`, {}),
  reject: (id: string, reason: string) =>
    apiClient.post<ServiceProvider>(`/api/v1/service-providers/${id}/reject`, { reason }),
  listAdmins: (id: string) =>
    apiClient.get<ProviderAdmin[]>(`/api/v1/service-providers/${id}/admins`),
  assignAdmin: (id: string, data: { userId: string; isPrimary?: boolean }) =>
    apiClient.post<ProviderAdmin[]>(`/api/v1/service-providers/${id}/admins`, data),
  removeAdmin: (id: string, userId: string) =>
    apiClient.delete<{ serviceProviderId: string; userId: string; deleted: boolean }>(
      `/api/v1/service-providers/${id}/admins/${userId}`,
    ),
  searchPublic: (params: Record<string, string | number | undefined> = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') sp.set(key, String(value));
    });
    const q = sp.toString() ? `?${sp}` : '';
    return apiClient.get<ServiceProvidersListResponse>(`/api/v1/service-providers/search${q}`);
  },
};
