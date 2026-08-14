import { apiClient } from '../utils/apiClient';
import type { Listing } from '../types';

export const listingsApi = {
  getAll: (searchQuery?: string) => {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return apiClient.get<Listing[]>(`/api/v1/listings${query}`);
  },

  getById: (id: string) => apiClient.get<Listing>(`/api/v1/listings/${id}`),

  create: (data: Partial<Listing>) => apiClient.post<Listing>('/api/v1/listings', data),

  update: (id: string, data: Partial<Listing>) =>
    apiClient.patch<Listing>(`/api/v1/listings/${id}`, data),

  updateStatus: (id: string, status: boolean) =>
    apiClient.patch<Listing>(`/api/v1/listings/${id}/status`, { status }),

  delete: (id: string) => apiClient.delete<void>(`/api/v1/listings/${id}`),
};
