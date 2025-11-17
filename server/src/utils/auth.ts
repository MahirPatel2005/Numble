import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, username: string, accountType: 'guest' | 'persistent'): string => {
  return jwt.sign({ userId, username, accountType }, JWT_SECRET, { expiresIn: '30d' });
};

export const generateGuestToken = (): string => {
  return randomBytes(32).toString('hex');
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const encryptSecretNumber = (secret: string): string => {
  return Buffer.from(secret).toString('base64');
};

export const decryptSecretNumber = (encrypted: string): string => {
  return Buffer.from(encrypted, 'base64').toString();
};
