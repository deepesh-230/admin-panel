import { Link } from 'react-router-dom';
import { homePathForRole, useAuth } from '../contexts/AuthContext';

export const NotFoundPage = () => {
  const { user } = useAuth();
  const home = homePathForRole(user?.role || 'ADMIN');

  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-semibold text-gray-800">Page not found</h1>
      <p className="text-gray-500 mt-2">This page is not part of the admin app.</p>
      <Link to={home} className="inline-block mt-5 text-sm font-medium text-primary hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
};
