import express from 'express'
import type { Request, Response } from 'express'
import BannedBook from '../models/BannedBook'
import { auth, type AuthRequest } from '../utils/auth'

const bannedBookRouter = express.Router()

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
bannedBookRouter.patch('/comments/:bookId', auth, async (req: AuthRequest, res: Response) => {
  const bookId = req.params.bookId
  const { newComment } = req.body
  try {
    const updatedBannedBook = await BannedBook.findByIdAndUpdate(bookId, {
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
      updatedBannedBook
    })
  } catch (error) {
    console.error('追加评论错误：', (error as Error).message)
    res.status(500).json({
      error: '追加评论错误：'
    })
  }
})

export default bannedBookRouter