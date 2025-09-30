import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_dev_secret'

export interface AuthRequest extends Request {
  user?: any;
}

export const authAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.cookies.guestToken;

  if (!token) {
    return res.status(401).json({
      authenticated: false,
      message: '没有token'
    })
  }

  // token verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    if (req.user.role === "Administrator") {
      next()
    } else {
      res.status(403).json({
        authenticated: false,
        message:'无访问权限'
      })
    }
  } catch (error) {
    res.status(401).json({
      authenticated: false,
      message: '无有效token！'
    })
  }
}