import express from 'express'
import type { Request, Response } from 'express'
import { type AuthRequest } from '../utils/auth'
import multer from 'multer'
import News from '../models/News'
import Comment from '../models/Comment'
import { bucket, deleteFolder, uploadFileToGCS } from '../utils/gcsOperating'
import { authAdmin } from '../utils/authAdmin'

const newsRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });

//上传图片至GCS
newsRouter.post("/image/upload", authAdmin, upload.single("image"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  //将文件上传至gcs 将图片url返回给前端
  try {
    const url = await uploadFileToGCS(req.file);
    res.status(200).json({ url });
  } catch (err) {
    console.error("Upload to GCS error:", (err as Error).message);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 删除临时文件
newsRouter.post("/image/delete", authAdmin, async (req: AuthRequest, res: Response) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing image URL" });

  try {
    // 获取GCS上保存的文件路径
    const objectPath = decodeURIComponent(new URL(url).pathname.replace(/^\/[^/]+\//, ''));
    // 删除该文件
    await bucket.file(objectPath).delete();
    res.status(200).json({ message: "Image deleted" });
  } catch (err) {
    console.error("Delete GCS error:", (err as Error).message);
    res.status(500).json({ error: "Delete failed" });
  }
});

// 上传新闻文章
newsRouter.post('/upload-news', authAdmin, async (req: AuthRequest, res: Response) => {
  const { title, content, source} = req.body;

  try {
    // 保存到 MongoDB
    await News.create({
      title,
      content,
      user: req.user?.userName || 'unknown', // 假设 auth 中挂载了 req.user
      source,
    })
    res.status(201).json({ message: 'Blog created successfully' });
  } catch (err) {
    console.error('Finalize blog error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

//获取新闻列表
newsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 9
    const total = await News.countDocuments()

    const newsList = await News.find()
      .sort({
        createdAt: -1
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    res.status(200).json({
      newsList,
      total,
    })
  } catch (error) {
    console.error('error fetching blogs:', (error as Error).message)
    res.status(500).json({
      error: '获取新闻失败'
    })
  }
})

//获取用户新闻列表
newsRouter.get('/mine', authAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 9

    const total = await News.countDocuments({ author: req.user.userName });
    const news = await News.find({ author: req.user.userName })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      news,
      total,
      user: req.user
    })
  } catch (error) {
    console.error('error fetching news:', (error as Error).message)
    res.status(500).json({
      error: '获取新闻失败'
    })
  }
})

// 获取具体新闻
newsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const news = await News.findById(req.params.id)
    if (!news) {
      return res.status(404).json({
        error: '新闻不存在'
      })
    }
    const comments = await Promise.all(
      news.comments.map((commentId) => Comment.findById(commentId))
    )
    res.status(200).json({
      news,
      comments
    })
  } catch (error) {
    console.error('error fetching news:', (error as Error).message)
    res.status(500).json({
      error: '获取新闻失败'
    })
  }
})

// 作者本人更新新闻
newsRouter.patch('/update/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const { title, content, source } = req.body; 
  try {
    // 保存到 MongoDB
    const updatedNews = await News.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userName }, //只能更新自己的文章
      {
        title,
        content,
        source,
      },
      { new: true }// 返回更新后的文档
    )
    if (!updatedNews) {
      return res.status(404).json({ error: '新闻不存在或无权限更新' });
    }
    res.status(200).json({ message: '新闻更新成功！', news: updatedNews });
  } catch (err) {
    console.error('Finalize news error:', (err as Error).message);
    res.status(500).json({ error: '新闻更新失败' });
  }
});

// 删除新闻，相关评论和图片
newsRouter.delete('/delete/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({
      error: '文章编号缺失'
    })
  }

  try {
    const deletedNews = await News.findOneAndDelete({ _id: id, user: req.user.userName }) //只有作者本人可以删除自己的文章
    if (!deletedNews) {
      return res.status(404).json({ error: '新闻不存在或无权限删除' });
    }

    // 删除该文章中的所有评论
    if (deletedNews.comments.length > 0) {
      await Promise.all(
        deletedNews.comments.map((id) => Comment.findByIdAndDelete(id))
      )
    }

    // 删除文章中的所有保存在gcs中的图片
    await deleteFolder(deletedNews.content);

    res.status(200).json({
      message: '新闻删除成功'
    })
  } catch (error) {
    console.error('删除新闻失败', (error as Error).message)
    res.status(500).json({
      error: '删除新闻失败'
    })
  }
})


export default newsRouter;