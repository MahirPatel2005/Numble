import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export const UpgradeGuestPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, setToken, setGuestToken, guestToken } = useAuthStore();
  const navigate = useNavigate();

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestToken) {
      setError('Not logged in as guest');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.upgradeGuest(guestToken, email, password);
      const { token, user } = response.data;

      setToken(token);
      setGuestToken(null);
      setUser(user);

      navigate('/game-menu');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upgrade failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/game-menu')}
          className="flex items-center gap-2 text-black font-semibold mb-8 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-black mb-2">Upgrade Account</h2>
          <p className="text-gray-600 text-sm mb-6">
            Convert your guest account to a permanent account and keep your stats!
          </p>

          <form onSubmit={handleUpgrade} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Upgrading...' : 'Upgrade Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
