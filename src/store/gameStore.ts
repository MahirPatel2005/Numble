import { create } from 'zustand';

interface GamePlayer {
  id: string;
  username: string;
  secretNumber?: string;
  guesses: Array<{ guessNumber: string; feedback: string[] }>;
  score: number;
}

interface GameState {
  roomCode: string | null;
  gameMode: string;
  gameState: 'waiting' | 'ready' | 'playing' | 'finished';
  players: GamePlayer[];
  currentTurn: string | null;
  winner: string | null;
  allowDuplicates: boolean;

  setRoomCode: (code: string) => void;
  setGameMode: (mode: string) => void;
  setGameState: (state: 'waiting' | 'ready' | 'playing' | 'finished') => void;
  setPlayers: (players: GamePlayer[]) => void;
  setCurrentTurn: (turn: string) => void;
  setWinner: (winner: string) => void;
  addGuess: (playerId: string, guess: string, feedback: string[]) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomCode: null,
  gameMode: 'classic',
  gameState: 'waiting',
  players: [],
  currentTurn: null,
  winner: null,
  allowDuplicates: false,

  setRoomCode: (code: string) => set({ roomCode: code }),
  setGameMode: (mode: string) => set({ gameMode: mode }),
  setGameState: (state: 'waiting' | 'ready' | 'playing' | 'finished') => set({ gameState: state }),

  setPlayers: (players: GamePlayer[]) => set({ players }),

  setCurrentTurn: (turn: string) => set({ currentTurn: turn }),

  setWinner: (winner: string) => set({ winner }),

  addGuess: (playerId: string, guess: string, feedback: string[]) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              guesses: [...p.guesses, { guessNumber: guess, feedback }],
              score: p.guesses.length + 1,
            }
          : p
      ),
    })),

  resetGame: () =>
    set({
      roomCode: null,
      gameMode: 'classic',
      gameState: 'waiting',
      players: [],
      currentTurn: null,
      winner: null,
      allowDuplicates: false,
    }),
}));
