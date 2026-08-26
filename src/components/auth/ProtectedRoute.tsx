import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { homePathForRole, useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../utils/roleAccess';

const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard.read',
  '/service-provider/category': 'categories.read',
  '/service-provider/sub-category': 'categories.read',
  '/service-provider/listing': 'providers.read',
  '/app-users': 'users.read',
  '/provider-admins': 'users.read',
  '/state-admins': 'state_admins.read',
  '/volunteer-admins': 'users.read',
  '/enquiries/user': 'enquiries.read',
  '/enquiries/provider': 'enquiries.read',
  '/marketplace/products': 'marketplace.read',
  '/marketplace/buyers': 'marketplace.read',
  '/marketplace/sellers': 'marketplace.read',
  '/volunteers': 'volunteers.read',
  '/faq': 'cms.read',
  '/useful-links': 'cms.read',
  '/support': 'cms.read',
  '/pages': 'cms.read',
  '/blogs': 'cms.read',
  '/jobs': 'cms.read',
  '/suggestions': 'cms.read',
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light text-gray-500">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const required = ROUTE_PERMISSIONS[location.pathname];
  if (required && !canAccess(user.permissions, required)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <>{children}</>;
};
