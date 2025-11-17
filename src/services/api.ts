import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('guestToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  signup: (username: string, email: string, password: string) =>
    api.post('/auth/signup', { username, email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  guestLogin: (username: string) =>
    api.post('/auth/guest-login', { username }),

  upgradeGuest: (guestToken: string, email: string, password: string) =>
    api.post('/auth/upgrade-guest', { guestToken, email, password }),

  verifyToken: (token?: string, guestToken?: string) =>
    api.post('/auth/verify-token', { token, guestToken }),
};

export const statsService = {
  getPlayerStats: (userId: string) =>
    api.get(`/stats/player/${userId}`),

  getLeaderboard: (limit: number = 100, offset: number = 0) =>
    api.get(`/stats/leaderboard?limit=${limit}&offset=${offset}`),

  getGameHistory: (userId: string, limit: number = 20, offset: number = 0) =>
    api.get(`/stats/history/${userId}?limit=${limit}&offset=${offset}`),

  getMe: () =>
    api.get('/stats/me'),
};

export default api;
