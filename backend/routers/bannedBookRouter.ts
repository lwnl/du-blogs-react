import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import BannedBook from '../models/BannedBook'
import { auth, type AuthRequest } from '../utils/auth'

const bannedBookRouter = express.Router()

// 预检中间件：检查书籍和评论是否存在 & 是否为本人
export const idChecking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { bookId, commentId } = req.params;

  try {
    const book = await BannedBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "书籍不存在" });
    }

    const comment = book.comments.find((c) => c._id?.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ error: "评论不存在" });
    }

    if (req.user.userName !== comment.author) {
      return res.status(403).json({ error: "只能操作本人的评论" });
    }

    // 挂到 req 上，后续中间件/路由直接用
    (req as any).book = book;
    (req as any).comment = comment;

    next();
  } catch (error) {
    console.error("预检失败:", (error as Error).message);
    res.status(500).json({ error: "预检失败" });
  }
};

//获取所有禁书
bannedBookRouter.get('/', async (req: Request, res: Response) => {
  try {
    const bannedBooks = await BannedBook.find()
    if (!bannedBooks) {
      return res.status(404).json({
        error: '数据不存在！'
      })
    }
    res.status(200).json({
      message: '成功获取禁书数据！',
      bannedBooks
    })
  } catch (error) {
    console.error('获取禁书失败：', (error as Error).message)
    res.status(500).json({
      error: '获取禁书失败'
    })
  }
})

//根据id获取禁书
bannedBookRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  console.log('id is:', id)

  try {
    const book = await BannedBook.findById(id)

    console.log('book is:', book)

    if (!book) return res.status(404).json({
      error: '数据不存在！'
    })

    res.status(200).json({
      message: '成功获取数据！',
      book
    })
  } catch (error) {
    console.error('获取数据出错：', (error as Error).message)
    res.status(500).json({
      error: '获取数据出错!'
    })
  }
})

// 追加评论
bannedBookRouter.patch('/:bookId/comments/new', auth, async (req: AuthRequest, res: Response) => {
  const bookId = req.params.bookId
  const { newComment } = req.body
  try {
    const updatedBook = await BannedBook.findByIdAndUpdate(bookId, {
      $push: {
        comments: {
          $each: [newComment], //要追加的元素
          $position: 0         // 追加的位置
        }
      }
    }, {
      new: true
    })
    res.status(200).json({
      message: '追加评论成功！',
      updatedBook
    })
  } catch (error) {
    console.error('追加评论错误：', (error as Error).message)
    res.status(500).json({
      error: '追加评论错误：'
    })
  }
})

// 更新某条评论
bannedBookRouter.patch('/:bookId/comments/update/:commentId', auth, idChecking, async (req: AuthRequest, res: Response) => {
  const { bookId, commentId } = req.params;
  const { updatedContent } = req.body

  try {
     // ✅ 更新评论内容，使用 $ 定位数组中的那一条
    const updatedBook = await BannedBook.findOneAndUpdate(
      { _id: bookId, "comments._id": commentId },
      { $set: { "comments.$.content": updatedContent } },
      { new: true }
    );

    res.status(200).json({
      message:'更新评论成功',
      updatedBook
    })
  } catch (error) {
    console.error('更新评论失败:', (error as Error).message);
    res.status(500).json({ error: '更新评论失败！' });
  }
})

// 删除某条评论
bannedBookRouter.delete('/:bookId/comments/:commentId', auth, idChecking, async (req: AuthRequest, res: Response) => {
  const { bookId, commentId } = req.params;
  try {
    // 执行删除逻辑
    const updatedBook = await BannedBook.findByIdAndUpdate(
      bookId,
      { $pull: { comments: { _id: commentId } } }, // 从数组中删除匹配的子文档
      { new: true }
    );

    res.status(200).json({
      message: '评论已删除',
      updatedBook,
    });
  } catch (error) {
    console.error('删除评论失败:', (error as Error).message);
    res.status(500).json({ error: '删除评论失败' });
  }
});

export default bannedBookRouter