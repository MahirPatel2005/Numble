import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { hashPassword, verifyPassword, generateToken, generateGuestToken, verifyToken } from '../utils/auth.js';

const router = Router();

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = new User({
      username,
      email,
      passwordHash,
      accountType: 'persistent',
    });

    await user.save();
    const token = generateToken(user._id.toString(), user.username, 'persistent');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString(), user.username, 'persistent');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/guest-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    let user = await User.findOne({ username, accountType: 'guest' });

    if (!user) {
      user = new User({
        username,
        accountType: 'guest',
      });
      await user.save();
    }

    const guestToken = generateGuestToken();
    const session = new Session({
      guestToken,
      userId: user._id.toString(),
      username: user.username,
    });

    await session.save();

    res.json({
      guestToken,
      user: {
        id: user._id,
        username: user.username,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Guest login failed' });
  }
});

router.post('/upgrade-guest', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestToken, email, password } = req.body;

    const session = await Session.findOne({ guestToken });
    if (!session) {
      res.status(401).json({ error: 'Invalid guest token' });
      return;
    }

    const user = await User.findById(session.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const passwordHash = await hashPassword(password);
    user.email = email;
    user.passwordHash = passwordHash;
    user.accountType = 'persistent';

    await user.save();
    await Session.deleteOne({ guestToken });

    const token = generateToken(user._id.toString(), user.username, 'persistent');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Upgrade failed' });
  }
});

router.post('/verify-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, guestToken } = req.body;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        res.json({ valid: true, user });
        return;
      }
    }

    if (guestToken) {
      const session = await Session.findOne({ guestToken });
      if (session) {
        const user = await User.findById(session.userId);
        res.json({ valid: true, user });
        return;
      }
    }

    res.json({ valid: false });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
