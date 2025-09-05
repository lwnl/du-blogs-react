import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import type { Request, Response } from 'express'
import User from '../models/User'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'

dotenv.config()
const userRouter = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_dev_secret'


// 获取所有用户
userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find()
    res.status(200).json({ users })
  } catch (error) {
    console.error('获取用户数据出错：', (error as Error).message)
    res.status(500).json({
      error: '获取用户数据出错!'
    })
  }
})

// User registration
userRouter.post('/registered-user', async (req: Request, res: Response) => {
  const { userName, password } = req.body

  if (!userName || !password) {
    return res.status(400).json({
      message: 'Username and password are required!'
    })
  }

  try {
    const existingUser = await User.findOne({ userName })
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在！' })
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = await User.create({ userName, password: hashedPassword, role: "Registered User" })

    // generate JWT token
    const token = jwt.sign(
      { id: newUser._id, userName: newUser.userName, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only under https
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // one day
    })
    res.status(201).json({
      message: 'New user registered successfully'
    })
  } catch (error) {
    console.error('User already exists', (error as Error).message)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// 创建游客id
userRouter.post('/guests/new', async (req: Request, res: Response) => {
  try {
    const guests = await User.find({ role: "Guest" })
    // guestNumber 三位以下自动补“0”
    const guestNumber = (guests.length + 1).toString().padStart(3, '0')
    const userName = '游客' + guestNumber
    const newguest = await User.create({
      userName
    })

    // 设置guestToken
    const guestToken = jwt.sign(
      { id: newguest._id, userName, role: newguest.role },
      JWT_SECRET,
    )

    // Set token in HTTP-only cookie
    res.cookie('guestToken', guestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only under https
      sameSite: 'lax',
      maxAge: 100 * 365 * 24 * 60 * 60 * 1000 // 100 年
    })

    res.status(201).json({
      message: '游客ID创建成功',
      userName,
      role: newguest.role
    })
  } catch (error) {
    console.error('创建游客失败!', (error as Error).message)
    res.status(500).json({
      error: '创建游客失败!'
    })
  }
})

//  User login
userRouter.post('/login', async (req: AuthRequest, res: Response) => {

  const { userName, password } = req.body

  if (!userName || !password) {
    return res.status(401).json({ message: 'Missing credentials' });
  }

  try {
    const user = await User.findOne({ userName })

    // check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Username does not exist.' })
    }

    // Compare input password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Password is incorrect.' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userName: user.userName, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    //  Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only under https
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // one day
    })
  } catch (error) {
    console.error('Login error:', (error as Error).message)
    return res.status(500).json({
      message: 'Login error'
    })
  }

  res.status(200).json({ message: 'Login successful' })
})

// login check
userRouter.get('/login-check', auth, (req: AuthRequest, res: Response) => {
  if (req.user) {
    return res.status(200).json({
      user: req.user,
      authenticated: true
    })
  } else {
    return res.status(401).json({
      authenticated: false,
      message: 'Not authenticated'
    });
  }
})

// User logout 
userRouter.post('/logout', (req: Request, res: Response) => {
  // 移除注册用户token
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  //移除游客token
  res.clearCookie('guestToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return res.status(200).json({
    message: 'Logout successful!',
    authenticated: false
  })
})


export default userRouter;