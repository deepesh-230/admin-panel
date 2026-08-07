import { apiClient } from '../utils/apiClient';
import type { Listing } from '../types';

export const listingsApi = {
  getAll: (searchQuery?: string) => {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return apiClient.get<Listing[]>(`/listings${query}`);
  },
  
  getById: (id: string) => 
    apiClient.get<Listing>(`/listings/${id}`),
    
  create: (data: Partial<Listing>) => 
    apiClient.post<Listing>('/listings', data),
    
  update: (id: string, data: Partial<Listing>) => 
    apiClient.patch<Listing>(`/listings/${id}`, data),
    
  updateStatus: (id: string, status: boolean) =>
    apiClient.patch<Listing>(`/listings/${id}/status`, { status }),
    
  delete: (id: string) => 
    apiClient.delete<void>(`/listings/${id}`),
};
