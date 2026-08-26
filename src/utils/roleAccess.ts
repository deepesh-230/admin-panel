export const DASHBOARD_ROLES = new Set([
  'ADMIN',
  'STATE_ADMIN',
  'SERVICE_PROVIDER_ADMIN',
  'VOLUNTEER',
]);

export function homePathForRole(role: string) {
  switch (role) {
    case 'SERVICE_PROVIDER_ADMIN':
      return '/service-provider/listing';
    case 'VOLUNTEER':
      return '/volunteers';
    default:
      return '/dashboard';
  }
}

export function canAccess(permissions: string[] | undefined, code: string) {
  if (!permissions?.length) return false;
  return permissions.includes(code);
}

export function canAccessAny(permissions: string[] | undefined, codes: string[]) {
  return codes.some((code) => canAccess(permissions, code));
}
