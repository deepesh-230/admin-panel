import { apiClient } from '../utils/apiClient';
import type { Enquiry } from '../types';

export const enquiriesApi = {
  getAll: (searchQuery?: string) => {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return apiClient.get<Enquiry[]>(`/enquiries${query}`);
  },
  
  getById: (id: string) => 
    apiClient.get<Enquiry>(`/enquiries/${id}`),
    
  create: (data: Partial<Enquiry>) => 
    apiClient.post<Enquiry>('/enquiries', data),
    
  update: (id: string, data: Partial<Enquiry>) => 
    apiClient.patch<Enquiry>(`/enquiries/${id}`, data),
    
  delete: (id: string) => 
    apiClient.delete<void>(`/enquiries/${id}`),
};
