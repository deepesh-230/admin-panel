import { apiClient } from '../utils/apiClient';
import type { Enquiry } from '../types';

export const enquiriesApi = {
  getAll: (searchQuery?: string) => {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return apiClient.get<Enquiry[]>(`/api/v1/enquiries${query}`);
  },

  getById: (id: string) => apiClient.get<Enquiry>(`/api/v1/enquiries/${id}`),

  create: (data: Partial<Enquiry>) => apiClient.post<Enquiry>('/api/v1/enquiries', data),

  update: (id: string, data: Partial<Enquiry>) =>
    apiClient.patch<Enquiry>(`/api/v1/enquiries/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/v1/enquiries/${id}`),
};
