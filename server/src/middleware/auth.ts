import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        username: string;
        accountType: 'guest' | 'persistent';
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.auth = decoded;
  next();
};
