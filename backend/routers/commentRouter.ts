import express from 'express'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'
import type { Request, Response } from 'express'
import Comment from '../models/Comment'
import Article from '../models/Article'

const commentRouter = express.Router()

// 新建评论
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

// 更新评论
commentRouter.patch('/update/:id', auth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  const userName = req.user.userName
  const { content } = req.body

  const updatedComment = await Comment.findById(id)
  if (!updatedComment) {
    return res.status(404).json({
      message: '该评论不存在！'
    })
  }

  if (userName !== updatedComment.author) {
    return res.status(403).json({
      message: '只有评论者本人才能修改该评论！'
    })
  }

  // 更新评论
  try {
    await Comment.findByIdAndUpdate(id, {
      content
    }, {
      new: true
    })
    res.status(200).json({
      message: '更新评论成功！',
      updatedComment
    })
  } catch (error) {
    console.error('更新评论失败:', (error as Error).message)
    res.status(500).json({
      error: '更新评论失败！'
    })
  }
})

// 删除评论
commentRouter.delete('/delete/:id', auth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  const userName = req.user.userName

  const deletedComment = await Comment.findById(id)
  if (!deletedComment) {
    return res.status(404).json({ error: '该评论不存在！' })
  }

  if (userName !== deletedComment.author) {
    return res.status(403).json({ message: '只有评论者本人才能删除该评论！' })
  }

  try {
    await Comment.findByIdAndDelete(id)

    // 从 Article 中删除该评论 id
    await Article.findByIdAndUpdate(
      deletedComment.subjectId,
      { $pull: { comments: deletedComment._id } }
    )

    res.status(200).json({ message: '成功删除评论' })
  } catch (error) {
    console.error('删除评论错误：', (error as Error).message)
    res.status(500).json({ error: '删除评论出错！' })
  }
})



export default commentRouter