import express from 'express'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'
import type { Request, Response } from 'express'
import Comment from '../models/Comment'
import Article from '../models/Article'

const commentRouter = express.Router()

commentRouter.post('/new', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, content } = req.body;
    const author = req.user.userName;

    // 1. 创建评论
    const newComment = await Comment.create({
      subjectId,
      content,
      author
    });

    // 2. 把评论 ID 追加到文章中
    await Article.findByIdAndUpdate(
      subjectId,
      { $push: { comments: newComment._id } }
    );

    res.status(201).json({ message: "评论成功", newComment });
  } catch (error) {
    console.error('添加评论失败：', (error as Error).message)
    res.status(500).json({
      error: '添加评论失败！'
    })
  }
})

export default commentRouter