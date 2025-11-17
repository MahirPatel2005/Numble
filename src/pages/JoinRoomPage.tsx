import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom, getSocket, initSocket } from '../services/socket';
import { ArrowLeft } from 'lucide-react';

export const JoinRoomPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (roomCode.trim().length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const socket = getSocket() || initSocket();
      const response = await joinRoom(roomCode.toUpperCase());

      navigate('/game', {
        state: {
          roomCode: roomCode.toUpperCase(),
          joined: true,
        },
      });
    } catch (err: any) {
      setError(err.error || 'Failed to join room');
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
          <h2 className="text-3xl font-bold text-black mb-6">Join a Room</h2>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition text-lg text-center tracking-widest font-bold"
                placeholder="E.g., ABC123"
                required
              />
              <p className="text-xs text-gray-500 mt-2">Enter the 6-character room code from your host</p>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || roomCode.length !== 6}
              className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
