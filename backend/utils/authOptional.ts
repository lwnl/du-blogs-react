import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import type { AuthRequest } from './auth'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_dev_secret'

export const authOptional = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(); // 未登录，直接放行
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    console.warn('Invalid or expired token, proceeding as guest');
  }
  
  next();
};