import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_dev_secret'

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token
  const guestToken = req.cookies?.guestToken

  if (!token && !guestToken) {
    return res.status(401).json({
      authenticated: false,
      message: 'No token provided'
    })
  }

  // token verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      authenticated: false,
      message: 'Invalid or expired token'
    })
  }
}