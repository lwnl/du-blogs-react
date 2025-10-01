import express from 'express'
import type { Request, Response } from 'express'
import { type AuthRequest } from '../utils/auth'
import News from '../models/News'
import Comment from '../models/Comment'
import { bucket, deleteFolder, moveFolder, uploadFileToGCS } from '../utils/gcsOperating'
import { authAdmin } from '../utils/authAdmin'
import type mongoose from 'mongoose'
import { upload } from './articleRouter'

const newsRouter = express.Router()


//上传图片至GCS
newsRouter.post("/image/upload/temp", authAdmin, upload.single("image"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  //将文件上传至gcs 将图片url返回给前端
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "未登录用户" });
    }

    const userId = req.user.id.toString();
    const folder = `in-news/temp/${userId}`;

    const url = await uploadFileToGCS(req.file, folder);
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
  const { title, content, keyWordsArray:keyWords  } = req.body;
  const userId = req.user?.id.toString();

  try {
    // 1. 创建文章
    const news = await News.create({
      title,
      content,
      keyWords,
      author: req.user?.userName || "unknown",
    });


    const newsId = (news._id as mongoose.Types.ObjectId).toString();


    // 2. 移动 temp 文件夹里的图片到 in-news/<newsId>
    const tempPrefix = `projects/free-talk/images/in-news/temp/${userId}/`;
    const destPrefix = `projects/free-talk/images/in-news/${newsId}/`;
    await moveFolder(tempPrefix, destPrefix);

    // 3. 替换文章内容中的图片路径为公开 URL
    const imgRegex = new RegExp(
      `https://storage\\.googleapis\\.com/daniel-jansen7879-bucket-1/projects/free-talk/images/in-news/temp/${userId}/([^"?]+)`,
      "g"
    );

    const updatedContent = content.replace(imgRegex, (_: string, filename: string) => {
      return `https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/free-talk/images/in-news/${newsId}/${filename}`;
    });

    // 4. 保存更新后的文章内容
    news.content = updatedContent;
    await news.save();

    // 5. 清理 temp 文件夹（可选）
    await deleteFolder(tempPrefix);

    res.status(201).json({ message: "成功添加新文章", news });
  } catch (err) {
    console.error("Finalize blog error:", (err as Error).message);

    // 提交失败 → 清理 temp 文件
    await deleteFolder(`projects/free-talk/images/in-news/temp/${userId}/`);
    res.status(500).json({ error: "创建新闻出错！" });
  }
});

//获取新闻列表
newsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 9
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

    const total = await News.countDocuments(filter)

    const newsList = await News.find(filter)
      .sort({
        createdAt: -1
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    res.status(200).json({
      articles: newsList,
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
      article: news,
      comments
    })
  } catch (error) {
    console.error('获取文章失败:', (error as Error).message)
    res.status(500).json({
      error: '获取文章失败'
    })
  }
})

// 作者本人更新新闻
newsRouter.patch('/update/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const { title, content, keyWordsArray:keyWords } = req.body;
  const { id } = req.params;
  const userId = req.user.id.toString();

  try {
    // 1. 查找文章
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ error: "新闻不存在" });
    }

    // ✅ 确保是作者本人
    if (news.author !== req.user.userName) {
      return res.status(403).json({ error: "无权限更新此文章" });
    }

    // 2. 移动图片：temp/<userId> → in-news/<id>
    await moveFolder(
      `projects/free-talk/images/in-news/temp/${userId}/`,
      `projects/free-talk/images/in-news/${id}/`
    );

    // 3. 替换文章内容中的路径
    const updatedContent = content.replace(
      new RegExp(`projects/free-talk/images/in-news/temp/${userId}/`, "g"),
      `projects/free-talk/images/in-news/${id}/`
    );

    // 4. 更新文章数据
    news.title = title;
    news.content = updatedContent;
    news.keyWords = keyWords;
    const updatedNews = await news.save();

    res.status(200).json({ message: '文章更新成功！', updatedNews });
  } catch (err) {
    console.error('更新新闻失败:', (err as Error).message);


    // 更新失败 → 清理当前用户的 temp
    if (req.user?.id) {
      await deleteFolder(
        `projects/free-talk/images/in-news/temp/${req.user.id.toString()}/`
      );
    }
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除新闻，相关评论和图片
newsRouter.delete('/delete/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({
      error: '新闻编号缺失'
    })
  }

  const folder = `projects/free-talk/images/in-news/${id}`;


  try {
    const deletedNews = await News.findOneAndDelete({ _id: id, author: req.user.userName }) //只有作者本人可以删除自己的文章
    if (!deletedNews) {
      return res.status(404).json({ error: '新闻不存在或无权限删除' });
    }

    // 删除该文章中的所有评论
    if (deletedNews.comments.length > 0) {
      await Promise.all(
        deletedNews.comments.map((id) => Comment.findByIdAndDelete(id))
      )
    }

    // 删除文章中的所有保存在gcs中的文件
    await deleteFolder(folder);

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