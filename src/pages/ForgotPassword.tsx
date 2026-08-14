import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken(null);
    setSubmitting(true);
    try {
      const data = await authApi.forgotPassword(email.trim());
      setMessage('If the email exists, a reset link has been sent.');
      if (data?.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your admin email to receive a password reset token.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
              {message}
            </div>
          )}
          {resetToken && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 break-all">
              Dev reset token: {resetToken}
              <div className="mt-2">
                <Link
                  to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="text-primary font-semibold hover:underline"
                >
                  Continue to reset password
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold text-sm disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          <Link to="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};
