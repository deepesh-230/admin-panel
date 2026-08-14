import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const [email, setEmail] = useState('admin@divyaangdisha.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
            DD
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Divyaang Disha</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="admin@divyaangdisha.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <a href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </a>
        </p>

        <p className="mt-4 text-xs text-center text-gray-400">
          Default: admin@divyaangdisha.com / Admin@123
        </p>
      </div>
    </div>
  );
};
