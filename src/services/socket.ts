import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket) return socket;

  socket = io(API_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const authenticateSocket = (token?: string, guestToken?: string) => {
  const s = getSocket() || initSocket();
  return new Promise((resolve, reject) => {
    s.emit('authenticate', { token, guestToken }, (response: any) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

export const createRoom = (gameMode: string, allowDuplicates: boolean) => {
  const s = getSocket();
  if (!s) throw new Error('Socket not initialized');

  return new Promise((resolve, reject) => {
    s.emit('create-room', { gameMode, allowDuplicates }, (response: any) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

export const joinRoom = (roomCode: string) => {
  const s = getSocket();
  if (!s) throw new Error('Socket not initialized');

  return new Promise((resolve, reject) => {
    s.emit('join-room', { roomCode }, (response: any) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

export const submitSecret = (roomCode: string, secretNumber: string) => {
  const s = getSocket();
  if (!s) throw new Error('Socket not initialized');

  return new Promise((resolve, reject) => {
    s.emit('submit-secret', { roomCode, secretNumber }, (response: any) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

export const submitGuess = (roomCode: string, guessNumber: string) => {
  const s = getSocket();
  if (!s) throw new Error('Socket not initialized');

  return new Promise((resolve, reject) => {
    s.emit('submit-guess', { roomCode, guessNumber }, (response: any) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

export const onRoomUpdated = (callback: (data: any) => void) => {
  const s = getSocket();
  if (s) s.on('room-updated', callback);
};

export const onGameStarted = (callback: (data: any) => void) => {
  const s = getSocket();
  if (s) s.on('game-started', callback);
};

export const onGuessReceived = (callback: (data: any) => void) => {
  const s = getSocket();
  if (s) s.on('guess-received', callback);
};

export const offRoomUpdated = () => {
  const s = getSocket();
  if (s) s.off('room-updated');
};

export const offGameStarted = () => {
  const s = getSocket();
  if (s) s.off('game-started');
};

export const offGuessReceived = () => {
  const s = getSocket();
  if (s) s.off('guess-received');
};
