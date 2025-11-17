import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import { authenticateSocket, initSocket } from '../services/socket';

interface GuestLoginPageProps {
  onSwitch: (page: 'login' | 'signup' | 'guest') => void;
}

export const GuestLoginPage: React.FC<GuestLoginPageProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, setGuestToken } = useAuthStore();
  const navigate = useNavigate();

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.guestLogin(username);
      const { guestToken, user } = response.data;

      setGuestToken(guestToken);
      setUser(user);

      initSocket();
      await authenticateSocket(undefined, guestToken);

      navigate('/game-menu');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Guest login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-black">Numble</h1>
          <p className="text-center text-gray-600 text-sm mb-8">Play as Guest</p>

          <form onSubmit={handleGuestLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
                placeholder="Enter your username"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                You can upgrade to a full account later
              </p>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {isLoading ? 'Starting...' : 'Play as Guest'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Have an account?{' '}
              <button
                onClick={() => onSwitch('login')}
                className="text-black font-semibold hover:underline"
              >
                Login
              </button>
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Or{' '}
              <button
                onClick={() => onSwitch('signup')}
                className="text-black font-semibold hover:underline"
              >
                create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
