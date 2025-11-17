import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import {
  createRoom,
  joinRoom,
  submitSecret,
  submitGuess,
  getSocket,
  onRoomUpdated,
  onGameStarted,
  onGuessReceived,
  offRoomUpdated,
  offGameStarted,
  offGuessReceived,
} from '../services/socket';
import { NumericKeypad } from '../components/Game/NumericKeypad';
import { GuessHistory } from '../components/Game/GuessHistory';
import { Copy } from 'lucide-react';

export const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const gameStore = useGameStore();

  const [step, setStep] = useState<'init' | 'room' | 'secret' | 'playing' | 'finished'>('init');
  const [roomCode, setRoomCode] = useState('');
  const [secretNumber, setSecretNumber] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const gameMode = location.state?.gameMode || 'classic';
  const allowDuplicates = location.state?.allowDuplicates || false;
  const action = location.state?.action || 'create';

  const digitCount = gameMode === 'ultimate' ? 6 : 4;

  useEffect(() => {
    if (action === 'create') {
      initializeCreate();
    }

    return () => {
      offRoomUpdated();
      offGameStarted();
      offGuessReceived();
    };
  }, []);

  const initializeCreate = async () => {
    try {
      const response = await createRoom(gameMode, allowDuplicates);
      gameStore.setRoomCode(response.roomCode);
      gameStore.setGameMode(gameMode);
      setRoomCode(response.roomCode);
      setStep('room');
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const handleSecretSubmit = async () => {
    if (secretNumber.length !== digitCount) {
      setError(`Secret number must be ${digitCount} digits`);
      return;
    }

    try {
      await submitSecret(roomCode, secretNumber);
      setSecretNumber('');
      setStep('secret');
    } catch (err) {
      setError('Failed to submit secret');
    }
  };

  const handleGuessSubmit = async () => {
    if (guessInput.length !== digitCount) {
      setError(`Guess must be ${digitCount} digits`);
      return;
    }

    try {
      const response = await submitGuess(roomCode, guessInput);
      setGuessInput('');

      if (response.isWin) {
        gameStore.setWinner(user?.id || '');
        setStep('finished');
      }
    } catch (err) {
      setError('Failed to submit guess');
    }
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    onRoomUpdated((data) => {
      gameStore.setPlayers(data.players);
      if (data.gameState === 'ready') {
        setStep('secret');
      }
    });

    onGameStarted(() => {
      setStep('playing');
    });

    onGuessReceived((data) => {
      gameStore.addGuess(data.playerId, data.guessNumber, data.feedback);
      if (data.gameState === 'finished') {
        gameStore.setWinner(data.winner);
        setStep('finished');
      } else {
        gameStore.setCurrentTurn(data.currentTurn);
      }
    });
  }, []);

  if (step === 'room') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-black mb-6">Room Created</h2>

          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Room Code</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-black">{roomCode}</span>
              <button
                onClick={handleCopyRoomCode}
                className="p-2 hover:bg-gray-200 rounded transition"
              >
                <Copy size={20} />
              </button>
            </div>
            {copied && <p className="text-sm text-green-600 mt-2">Copied!</p>}
          </div>

          <p className="text-gray-600 mb-4">Waiting for opponent...</p>

          <div className="space-y-2">
            {gameStore.players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                <span className="font-medium">{player.username}</span>
                <span className="text-sm text-gray-600">
                  {player.secretNumber ? '✓ Ready' : 'Not ready'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'secret') {
    const allReady = gameStore.players.every((p) => p.secretNumber);

    if (allReady) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-black mb-6">Game Starting!</h2>
            <p className="text-gray-600 mb-4">Both players have set their secret numbers.</p>
            <p className="text-gray-600">Get ready to start guessing...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-black mb-6">Set Your Secret Number</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter a {digitCount}-digit secret number. Your opponent will try to guess it.
          </p>

          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
            <p className="text-3xl font-bold text-black tracking-widest">
              {secretNumber.padEnd(digitCount, '•')}
            </p>
          </div>

          <NumericKeypad
            value={secretNumber}
            onChange={setSecretNumber}
            onSubmit={handleSecretSubmit}
            maxLength={digitCount}
            disabled={false}
          />

          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (step === 'playing') {
    const me = gameStore.players.find((p) => p.id === user?.id);
    const opponent = gameStore.players.find((p) => p.id !== user?.id);
    const isMyTurn = gameStore.currentTurn === user?.id;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-black mb-4">{user?.username} (You)</h3>
              {me && <GuessHistory guesses={me.guesses} maxLength={digitCount} />}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-black mb-4">{opponent?.username}</h3>
              {opponent && <GuessHistory guesses={opponent.guesses} maxLength={digitCount} />}
            </div>
          </div>

          {isMyTurn && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-lg font-bold text-black mb-4">Your Turn</h3>
                <p className="text-gray-600 mb-4">Guess your opponent's {digitCount}-digit number</p>

                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
                  <p className="text-3xl font-bold text-black tracking-widest">
                    {guessInput.padEnd(digitCount, '•')}
                  </p>
                </div>

                <NumericKeypad
                  value={guessInput}
                  onChange={setGuessInput}
                  onSubmit={handleGuessSubmit}
                  maxLength={digitCount}
                  disabled={false}
                />

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
              </div>
            </div>
          )}

          {!isMyTurn && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-gray-100 rounded-2xl p-8 text-center">
                <p className="text-lg font-semibold text-gray-700">Waiting for {opponent?.username}...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'finished') {
    const winner = gameStore.players.find((p) => p.id === gameStore.winner);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Game Over!</h2>

          {gameStore.winner === user?.id ? (
            <div className="mb-6">
              <p className="text-2xl font-bold text-green-600">You Won! 🎉</p>
              {me && (
                <p className="text-gray-600 mt-2">
                  You guessed it in {me.guesses.length} attempts
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-2xl font-bold text-red-600">You Lost</p>
              <p className="text-gray-600 mt-2">{winner?.username} guessed it first</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => {
                gameStore.resetGame();
                navigate('/game-menu');
              }}
              className="w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Back to Menu
            </button>

            <button
              onClick={() => {
                gameStore.resetGame();
                setStep('init');
                initializeCreate();
              }}
              className="w-full bg-gray-300 text-black font-semibold py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
