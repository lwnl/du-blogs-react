import express from 'express'
import type { Request, Response } from 'express'
import Article from '../models/Article'
import News from '../models/News'
import Video from '../models/Video'

const searchRouter = express.Router()

// 用关键字搜索结果
searchRouter.get('/tag/:keyword', async (req: Request, res: Response) => {
  const { keyword } = req.params
  const pageSize = parseInt(req.query.pageSize as string) || 5 //默认每页显示5条
  const newsPageNumber = parseInt(req.query.newsPageNumber as string) || 1 // 默认显示第一页
  const blogPageNumber = parseInt(req.query.blogPageNumber as string) || 1
  const videoPageNumber = parseInt(req.query.videoPageNumber as string) || 1

  console.log('pageSize:', pageSize)

  try {
    const [news, blogs, videos, newsCount, blogCount, videoCount] = await Promise.all([
      News.find({ keyWords: keyword })
        .sort({ createdAt: -1 })
        .skip((newsPageNumber - 1) * pageSize)
        .limit(pageSize),
      Article.find({ keyWords: keyword })
        .sort({ createdAt: -1 })
        .skip((blogPageNumber - 1) * pageSize)
        .limit(pageSize),
      Video.find({ keyWords: keyword })
        .sort({ createdAt: -1 })
        .skip((videoPageNumber - 1) * pageSize)
        .limit(pageSize),

      News.countDocuments({ keyWords: keyword }),
      Article.countDocuments({ keyWords: keyword }),
      Video.countDocuments({ keyWords: keyword })
    ])

    const searchResult = {
      news: news || [],
      blogs: blogs || [],
      videos: videos || [],
      totalPages: {
        news: Math.max(1, Math.ceil(newsCount / pageSize)),
        blog: Math.max(1, Math.ceil(blogCount / pageSize)),
        video: Math.max(1, Math.ceil(videoCount / pageSize)),
      }
    }

    console.log('searchResult is', searchResult)

    res.status(200).json({
      message: '成功返回搜索结果',
      searchResult
    })
  } catch (error) {
    console.error('搜索出错：', (error as Error).message)
    res.status(500).json({
      error: '搜索出错'
    })
  }
})

export default searchRouter