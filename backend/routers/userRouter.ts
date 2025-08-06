import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import type { Request, Response } from 'express'
import User from '../models/User'

dotenv.config()
const userRouter = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_dev_secret'

// User registration
userRouter.post('/register', async (req: Request, res: Response) => {
  const { userName, password } = req.body

  if (!userName || !password) {
    return res.status(400).json({
      message: 'Username and password are required!'
    })
  }

  try {
    const existingUser = await User.findOne({ userName })
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists, please choose another one' })
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = await User.create({ userName, password: hashedPassword })

    // generate JWT token
    const token = jwt.sign(
      { id: newUser._id, userName: newUser.userName },
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

//  User login
userRouter.post('/login', async (req: Request, res: Response) => {
  const { userName, password } = req.body

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
      { id: user._id, userName: user.userName },
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


export default userRouter;