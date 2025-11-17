import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import Game from '../models/Game.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/player/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      userId: user._id,
      username: user.username,
      stats: user.stats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const users = await User.find({ accountType: 'persistent' })
      .select('username stats')
      .sort({ 'stats.gamesWon': -1, 'stats.averageGuesses': 1 })
      .limit(Number(limit))
      .skip(Number(offset));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/history/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const games = await Game.find({
      'players.id': userId,
      gameState: 'finished',
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.auth.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      accountType: user.accountType,
      stats: user.stats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;
