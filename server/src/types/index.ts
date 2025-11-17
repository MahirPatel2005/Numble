export interface User {
  _id: string;
  username: string;
  email?: string;
  passwordHash?: string;
  accountType: 'guest' | 'persistent';
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalGuesses: number;
    bestTime?: number;
    currentWinStreak: number;
    averageGuesses: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  _id: string;
  roomCode: string;
  players: {
    id: string;
    username: string;
    secretNumber: string;
    guesses: Guess[];
    score: number;
  }[];
  gameMode: 'classic' | 'speed' | 'deception' | 'ultimate';
  gameState: 'waiting' | 'ready' | 'playing' | 'finished';
  currentTurn: string;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Guess {
  playerId: string;
  guessNumber: string;
  feedback: ('green' | 'yellow' | 'gray')[];
  timestamp: Date;
}

export interface AuthPayload {
  userId: string;
  username: string;
  accountType: 'guest' | 'persistent';
}

export interface SocketAuthData {
  token?: string;
  guestToken?: string;
  username?: string;
}

export interface GameConfig {
  digitCount: number;
  timePerTurn?: number;
  allowDuplicates: boolean;
  mode: 'classic' | 'speed' | 'deception' | 'ultimate';
}
