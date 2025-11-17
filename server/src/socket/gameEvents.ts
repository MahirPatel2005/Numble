import { Server as SocketIOServer, Socket } from 'socket.io';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Session from '../models/Session.js';
import { generateRoomCode, generateSecretNumber, calculateFeedback, isWinningGuess } from '../utils/gameLogic.js';
import { verifyToken } from '../utils/auth.js';

interface SocketUser {
  userId: string;
  username: string;
  accountType: 'guest' | 'persistent';
}

declare global {
  namespace Express {
    interface Socket {
      user?: SocketUser;
    }
  }
}

export const setupGameEvents = (io: SocketIOServer) => {
  io.on('connection', async (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('authenticate', async (data: any, callback) => {
      try {
        let user: SocketUser | null = null;

        if (data.token) {
          const decoded = verifyToken(data.token);
          if (decoded) {
            const dbUser = await User.findById(decoded.userId);
            if (dbUser) {
              user = {
                userId: dbUser._id.toString(),
                username: dbUser.username,
                accountType: dbUser.accountType,
              };
            }
          }
        } else if (data.guestToken) {
          const session = await Session.findOne({ guestToken: data.guestToken });
          if (session) {
            const dbUser = await User.findById(session.userId);
            if (dbUser) {
              user = {
                userId: dbUser._id.toString(),
                username: dbUser.username,
                accountType: dbUser.accountType,
              };
            }
          }
        }

        if (user) {
          (socket as any).user = user;
          callback({ success: true, user });
        } else {
          callback({ success: false, error: 'Authentication failed' });
        }
      } catch (error) {
        callback({ success: false, error: 'Authentication error' });
      }
    });

    socket.on('create-room', async (data: any, callback) => {
      try {
        if (!(socket as any).user) {
          callback({ success: false, error: 'Not authenticated' });
          return;
        }

        const roomCode = generateRoomCode();
        const gameConfig = {
          digitCount: data.gameMode === 'ultimate' ? 6 : 4,
          allowDuplicates: data.allowDuplicates || false,
          mode: data.gameMode || 'classic',
          timePerTurn: data.gameMode === 'speed' ? 30 : undefined,
        };

        const game = new Game({
          roomCode,
          players: [
            {
              id: (socket as any).user.userId,
              username: (socket as any).user.username,
              secretNumber: '',
              guesses: [],
              score: 0,
            },
          ],
          gameMode: gameConfig.mode,
          gameState: 'waiting',
          currentTurn: (socket as any).user.userId,
        });

        await game.save();
        socket.join(roomCode);

        callback({ success: true, roomCode, gameConfig });
      } catch (error) {
        callback({ success: false, error: 'Failed to create room' });
      }
    });

    socket.on('join-room', async (data: any, callback) => {
      try {
        if (!(socket as any).user) {
          callback({ success: false, error: 'Not authenticated' });
          return;
        }

        const { roomCode } = data;
        const game = await Game.findOne({ roomCode });

        if (!game) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        if (game.gameState !== 'waiting') {
          callback({ success: false, error: 'Game already in progress' });
          return;
        }

        if (game.players.length >= 2) {
          callback({ success: false, error: 'Room is full' });
          return;
        }

        game.players.push({
          id: (socket as any).user.userId,
          username: (socket as any).user.username,
          secretNumber: '',
          guesses: [],
          score: 0,
        });

        if (game.players.length === 2) {
          game.gameState = 'ready';
        }

        await game.save();
        socket.join(roomCode);

        io.to(roomCode).emit('room-updated', {
          roomCode,
          players: game.players.map((p) => ({ id: p.id, username: p.username })),
          gameState: game.gameState,
          gameMode: game.gameMode,
        });

        callback({ success: true, game });
      } catch (error) {
        callback({ success: false, error: 'Failed to join room' });
      }
    });

    socket.on('submit-secret', async (data: any, callback) => {
      try {
        if (!(socket as any).user) {
          callback({ success: false, error: 'Not authenticated' });
          return;
        }

        const { roomCode, secretNumber } = data;
        const game = await Game.findOne({ roomCode });

        if (!game) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        const player = game.players.find((p) => p.id === (socket as any).user.userId);
        if (!player) {
          callback({ success: false, error: 'Player not found' });
          return;
        }

        player.secretNumber = Buffer.from(secretNumber).toString('base64');

        const allSecretsSubmitted = game.players.every((p) => p.secretNumber);
        if (allSecretsSubmitted) {
          game.gameState = 'playing';
        }

        await game.save();

        if (allSecretsSubmitted) {
          io.to(roomCode).emit('game-started', { gameState: 'playing' });
        }

        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: 'Failed to submit secret' });
      }
    });

    socket.on('submit-guess', async (data: any, callback) => {
      try {
        if (!(socket as any).user) {
          callback({ success: false, error: 'Not authenticated' });
          return;
        }

        const { roomCode, guessNumber } = data;
        const game = await Game.findOne({ roomCode });

        if (!game || game.gameState !== 'playing') {
          callback({ success: false, error: 'Game not in progress' });
          return;
        }

        const guesser = game.players.find((p) => p.id === (socket as any).user.userId);
        const opponent = game.players.find((p) => p.id !== (socket as any).user.userId);

        if (!guesser || !opponent) {
          callback({ success: false, error: 'Invalid game state' });
          return;
        }

        const secretNumber = Buffer.from(opponent.secretNumber, 'base64').toString();
        const feedback = calculateFeedback(guessNumber, secretNumber);
        const isWin = isWinningGuess(feedback);

        guesser.guesses.push({
          guessNumber,
          feedback,
          timestamp: new Date(),
        });

        guesser.score = guesser.guesses.length;

        if (isWin) {
          game.gameState = 'finished';
          game.winner = guesser.id;

          const guesserUser = await User.findById(guesser.id);
          if (guesserUser && guesserUser.stats) {
            guesserUser.stats.gamesWon++;
            guesserUser.stats.gamesPlayed++;
            guesserUser.stats.totalGuesses += guesser.guesses.length;
            guesserUser.stats.currentWinStreak++;
            guesserUser.stats.averageGuesses = Math.round(
              guesserUser.stats.totalGuesses / guesserUser.stats.gamesPlayed
            );
            await guesserUser.save();
          }

          const opponentUser = await User.findById(opponent.id);
          if (opponentUser && opponentUser.stats) {
            opponentUser.stats.gamesPlayed++;
            opponentUser.stats.currentWinStreak = 0;
            await opponentUser.save();
          }
        } else {
          const otherPlayer = opponent;
          guesser.id = opponent.id;
          opponent.id = (socket as any).user.userId;
          game.currentTurn = opponent.id;
        }

        await game.save();

        io.to(roomCode).emit('guess-received', {
          playerId: guesser.id,
          guessNumber,
          feedback,
          gameState: game.gameState,
          winner: game.winner,
          currentTurn: game.currentTurn,
        });

        callback({ success: true, feedback, isWin });
      } catch (error) {
        callback({ success: false, error: 'Failed to submit guess' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
