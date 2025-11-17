import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { GuestLoginPage } from './GuestLoginPage';

type AuthPage = 'landing' | 'login' | 'signup' | 'guest';

export const LandingPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AuthPage>('landing');

  if (currentPage === 'login') {
    return <LoginPage onSwitch={(page) => setCurrentPage(page)} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onSwitch={(page) => setCurrentPage(page)} />;
  }

  if (currentPage === 'guest') {
    return <GuestLoginPage onSwitch={(page) => setCurrentPage(page)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-black mb-4">Numble</h1>
        <p className="text-xl text-gray-600 mb-12">
          A real-time multiplayer number guessing game. Challenge your opponent to find the secret
          number first.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentPage('signup')}
            className="w-full max-w-sm mx-auto block bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition text-lg"
          >
            Create Account
          </button>

          <button
            onClick={() => setCurrentPage('login')}
            className="w-full max-w-sm mx-auto block bg-white text-black font-semibold py-3 rounded-lg border-2 border-black hover:bg-gray-50 transition text-lg"
          >
            Login
          </button>

          <button
            onClick={() => setCurrentPage('guest')}
            className="w-full max-w-sm mx-auto block bg-gray-300 text-black font-semibold py-3 rounded-lg hover:bg-gray-400 transition text-lg"
          >
            Play as Guest
          </button>
        </div>

        <div className="mt-16 text-gray-600 text-sm space-y-2">
          <p>📊 Track your stats and climb the leaderboard</p>
          <p>🎮 Play multiple game modes</p>
          <p>⚡ Real-time multiplayer battles</p>
        </div>
      </div>
    </div>
  );
};
