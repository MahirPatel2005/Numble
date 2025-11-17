import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email?: string;
  accountType: 'guest' | 'persistent';
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalGuesses: number;
    averageGuesses: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  guestToken: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setGuestToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const restoreSession = () => {
    const token = localStorage.getItem('token');
    const guestToken = localStorage.getItem('guestToken');
    const userStr = localStorage.getItem('user');

    if (token || guestToken) {
      const user = userStr ? JSON.parse(userStr) : null;
      set({
        token,
        guestToken,
        user,
      });
    }
  };

  restoreSession();

  return {
    user: null,
    token: null,
    guestToken: null,
    isLoading: false,
    error: null,

    setUser: (user: User | null) => {
      set({ user });
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    },

    setToken: (token: string | null) => {
      set({ token });
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },

    setGuestToken: (token: string | null) => {
      set({ guestToken: token });
      if (token) {
        localStorage.setItem('guestToken', token);
      } else {
        localStorage.removeItem('guestToken');
      }
    },

    setIsLoading: (loading: boolean) => set({ isLoading: loading }),

    setError: (error: string | null) => set({ error }),

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('guestToken');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        guestToken: null,
        error: null,
      });
    },

    restoreSession,
  };
});
