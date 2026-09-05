import { apiClient } from '../utils/apiClient';

export type PermissionRoleName =
  | 'ADMIN'
  | 'STATE_ADMIN'
  | 'SERVICE_PROVIDER_ADMIN'
  | 'VOLUNTEER'
  | 'END_USER';

export type PermissionCatalogItem = {
  id: string | null;
  code: string;
  description: string;
  group: string;
};

export type PermissionRoleMeta = {
  name: PermissionRoleName;
  label: string;
  description: string;
  editable: boolean;
};

export type PermissionsMatrix = {
  permissions: PermissionCatalogItem[];
  roles: PermissionRoleMeta[];
  matrix: Record<string, string[]>;
  defaults: Record<string, string[]>;
};

export const permissionsApi = {
  getMatrix: () => apiClient.get<PermissionsMatrix>('/api/v1/permissions/matrix'),
  updateMatrix: (roles: Partial<Record<PermissionRoleName, string[]>>) =>
    apiClient.put<PermissionsMatrix>('/api/v1/permissions/matrix', { roles }),
  resetAll: () => apiClient.post<PermissionsMatrix>('/api/v1/permissions/reset'),
  resetRole: (roleName: PermissionRoleName) =>
    apiClient.post<PermissionsMatrix>(`/api/v1/permissions/roles/${roleName}/reset`),
};
