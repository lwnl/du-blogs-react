import express from 'express'
import type { Request, Response } from 'express'
import BannedBook from '../models/BannedBook'

const bannedBookRouter = express.Router()

bannedBookRouter.get('/', async (req: Request, res: Response) => {
  try {
    const bannedBooks = await BannedBook.find()
    if (!bannedBooks) {
      return res.status(404).json({
        error: '数据不存在！'
      })
    }
    res.status(200).json({
      message:'成功获取禁书数据！',
      bannedBooks
    })
  } catch (error) {
    console.error('获取禁书失败：', (error as Error).message)
    res.status(500).json({
      error: '获取禁书失败'
    })
  }
})

export default bannedBookRouter