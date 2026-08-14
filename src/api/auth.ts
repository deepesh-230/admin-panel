import { apiClient, type AuthTokens, type AuthUser } from '../utils/apiClient';

export type LoginResponse = {
  user: AuthUser;
} & AuthTokens;

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password }),

  me: () => apiClient.get<AuthUser>('/api/v1/auth/me'),

  logout: (refreshToken: string) =>
    apiClient.post<null>('/api/v1/auth/logout', { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post<{ resetToken?: string } | null>('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<null>('/api/v1/auth/reset-password', { token, newPassword }),
};
