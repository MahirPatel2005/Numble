import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const GameMenuPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState('classic');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const gameModes = [
    {
      id: 'classic',
      name: 'Classic',
      description: '4-digit number, unlimited guesses',
    },
    {
      id: 'speed',
      name: 'Speed Mode',
      description: '4-digit number, 30 seconds per turn',
    },
    {
      id: 'deception',
      name: 'Deception Mode',
      description: 'Allocate false hints to confuse opponent',
    },
    {
      id: 'ultimate',
      name: 'Ultimate Numble',
      description: '6-digit number, instant loss on wrong guess',
    },
  ];

  const handleCreateRoom = () => {
    navigate('/game', { state: { gameMode: selectedMode, allowDuplicates, action: 'create' } });
  };

  const handleJoinRoom = () => {
    navigate('/join-room', { state: { gameMode: selectedMode } });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-black">Numble</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">
              {user?.accountType === 'guest' ? '👤 Guest' : `👤 ${user?.username}`}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white border-2 border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">Select Game Mode</h2>

            <div className="space-y-3">
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedMode === mode.id
                      ? 'bg-black text-white border-2 border-black'
                      : 'bg-white border-2 border-gray-300 text-black hover:border-black'
                  }`}
                >
                  <h3 className="font-semibold text-lg">{mode.name}</h3>
                  <p className="text-sm opacity-75">{mode.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-lg p-4 border-2 border-gray-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-gray-700 font-medium">Allow duplicate digits</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-black text-white font-semibold py-4 rounded-lg hover:bg-gray-800 transition text-lg"
            >
              Create Room
            </button>

            <button
              onClick={handleJoinRoom}
              className="w-full bg-white border-2 border-black text-black font-semibold py-4 rounded-lg hover:bg-gray-50 transition text-lg"
            >
              Join Room
            </button>

            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-gray-300 text-black font-semibold py-4 rounded-lg hover:bg-gray-400 transition text-lg"
            >
              Leaderboard
            </button>

            {user?.accountType === 'guest' && (
              <button
                onClick={() => navigate('/upgrade')}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition text-lg"
              >
                Upgrade to Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
