import express from 'express'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'
import type { Request, Response } from 'express'
import Comment from '../models/Comment'

const commentRouter = express.Router()

commentRouter.post('/new', auth, async (req: AuthRequest, res: Response) => {
  try {
    const newComment = await Comment.create({
    author: req.user,
    subjectId: req.body.subjectId,
    content: req.body.content
  })
    res.status(201).json({
      message: '添加评论成功！',
      newComment
    })
  } catch (error) {
    console.error('添加评论失败：', (error as Error).message)
    res.status(500).json({
      error: '添加评论失败！'
    })
  }
 })