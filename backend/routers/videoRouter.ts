import express from 'express'
import type { Request, Response } from 'express'
import { type AuthRequest } from '../utils/auth'
import Video from '../models/Video'
import { authAdmin } from '../utils/authAdmin'
import Comment from '../models/Comment'
import { deleteFileByUrl } from '../utils/gcsOperating'

const videoRouter = express.Router()

//获取所有视频
videoRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 9 //默认每页显示9个条目
    const dateStr = req.query.date as string | undefined

    let filter = {} // 默认不筛选
    if (dateStr) {
      const start = new Date(dateStr)
      start.setHours(0, 0, 0, 0)

      const end = new Date(dateStr)
      end.setHours(23, 59, 59, 999)

      filter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      }
    }

    const total = await Video.countDocuments(filter)
    const videos = await Video.find(filter)
      .sort({
        createdAt: -1
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    res.status(200).json({
      videos,
      total,
    })
  } catch (error) {
    console.error('error fetching videos:', (error as Error).message)
    res.status(500).json({
      error: '获取视频失败'
    })
  }
})

// 删除视频，评论，缩略图
videoRouter.delete('/delete/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const id = req.params.id

  if (!id) {
    return res.status(400).json({
      error: '视频缺失'
    })
  }

  try {
    const deletedItem = await Video.findOneAndDelete({ _id: id })

    if (!deletedItem) {
      return res.status(404).json({
        error: "视频不存在"
      })
    }

    // 删除该条目对应的所有评论
    if (deletedItem.comments.length > 0) {
      await Promise.all(
        deletedItem.comments.map(id => Comment.findByIdAndDelete(id))
      )
    }

    // 删除存储在gcs中的图片和视频
    await deleteFileByUrl(deletedItem.videoUrl)
    if (deletedItem.imgUrl) await deleteFileByUrl(deletedItem.videoUrl)
      
    res.status(200).json({
      message: '成功删除！'
    })
  } catch (error) {
    console.error('删除失败', (error as Error).message)
    res.status(500).json({
      error: '删除失败！'
    })
  }
})

export default videoRouter