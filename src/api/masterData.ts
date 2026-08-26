import { apiClient } from '../utils/apiClient';

export type State = {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { subcategories: number };
  subcategories?: Subcategory[];
};

export type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  category?: { id: string; name: string };
  keywords?: Keyword[];
  _count?: { keywords: number };
};

export type Keyword = {
  id: string;
  term: string;
  subcategoryId: string;
  isActive: boolean;
  subcategory?: { id: string; name: string; categoryId: string };
};

export type StateAdmin = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  stateId: string | null;
  state?: { id: string; name: string; code: string | null } | null;
  role?: { name: string };
};

export const statesApi = {
  getAll: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<State[]>(`/api/v1/states${q}`);
  },
  create: (data: Partial<State>) => apiClient.post<State>('/api/v1/states', data),
  update: (id: string, data: Partial<State>) =>
    apiClient.patch<State>(`/api/v1/states/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/api/v1/states/${id}`),
};

export const categoriesApi = {
  getAll: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<Category[]>(`/api/v1/categories${q}`);
  },
  getOne: (id: string) => apiClient.get<Category>(`/api/v1/categories/${id}`),
  create: (data: Partial<Category>) => apiClient.post<Category>('/api/v1/categories', data),
  update: (id: string, data: Partial<Category>) =>
    apiClient.patch<Category>(`/api/v1/categories/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/api/v1/categories/${id}`),
  getSubcategories: (categoryId: string) =>
    apiClient.get<Subcategory[]>(`/api/v1/categories/${categoryId}/subcategories`),
};

export const subcategoriesApi = {
  getOne: (id: string) => apiClient.get<Subcategory>(`/api/v1/subcategories/${id}`),
  create: (data: Partial<Subcategory> & { categoryId: string; name: string }) =>
    apiClient.post<Subcategory>('/api/v1/subcategories', data),
  update: (id: string, data: Partial<Subcategory>) =>
    apiClient.patch<Subcategory>(`/api/v1/subcategories/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/api/v1/subcategories/${id}`),
  getKeywords: (subcategoryId: string) =>
    apiClient.get<Keyword[]>(`/api/v1/subcategories/${subcategoryId}/keywords`),
};

export const keywordsApi = {
  getAll: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<Keyword[]>(`/api/v1/keywords${q}`);
  },
  create: (data: { subcategoryId: string; term: string; isActive?: boolean }) =>
    apiClient.post<Keyword>('/api/v1/keywords', data),
  update: (id: string, data: Partial<Keyword>) =>
    apiClient.patch<Keyword>(`/api/v1/keywords/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/api/v1/keywords/${id}`),
};

export type VolunteerAdmin = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  role?: { name: string };
};

export const volunteerAdminsApi = {
  getAll: (params?: { search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString() ? `?${sp}` : '';
    return apiClient.get<VolunteerAdmin[]>(`/api/v1/volunteer-admins${q}`);
  },
  create: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => apiClient.post<VolunteerAdmin>('/api/v1/volunteer-admins', data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      isActive: boolean;
      password: string;
    }>,
  ) => apiClient.patch<VolunteerAdmin>(`/api/v1/volunteer-admins/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/api/v1/volunteer-admins/${id}`),
};

export const stateAdminsApi = {
  getAll: (params?: { search?: string; stateId?: string }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.stateId) sp.set('stateId', params.stateId);
    const q = sp.toString() ? `?${sp}` : '';
    return apiClient.get<StateAdmin[]>(`/api/v1/state-admins${q}`);
  },
  create: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    stateId: string;
  }) => apiClient.post<StateAdmin>('/api/v1/state-admins', data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      stateId: string;
      isActive: boolean;
      password: string;
    }>,
  ) => apiClient.patch<StateAdmin>(`/api/v1/state-admins/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/api/v1/state-admins/${id}`),
};
