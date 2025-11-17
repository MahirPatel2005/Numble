import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsService } from '../services/api';
import { ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  _id: string;
  username: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    averageGuesses: number;
  };
}

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await statsService.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/game-menu')}
          className="flex items-center gap-2 text-black font-semibold mb-8 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
          Back to Menu
        </button>

        <h1 className="text-4xl font-bold text-black mb-8">Leaderboard</h1>

        {isLoading ? (
          <div className="text-center text-gray-600">Loading leaderboard...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-6 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2">Wins</div>
              <div className="col-span-3">Played</div>
              <div className="col-span-2">Avg Guesses</div>
            </div>

            {leaderboard.map((entry, index) => (
              <div
                key={entry._id}
                className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 hover:bg-gray-50 transition items-center"
              >
                <div className="col-span-1">
                  <span className="text-lg font-bold text-black">{index + 1}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-medium text-black">{entry.username}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">{entry.stats.gamesWon}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-gray-600">{entry.stats.gamesPlayed}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">{entry.stats.averageGuesses.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
