import express from 'express'
import type { Request, Response } from 'express'
import { type AuthRequest } from '../utils/auth'
import multer from 'multer'
import Article from '../models/Article'
import Comment from '../models/Comment'
import { bucket, deleteFolder, moveFolder, uploadFileToGCS } from '../utils/gcsOperating'
import { authAdmin } from '../utils/authAdmin'
import type mongoose from 'mongoose'

const articleRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });

//上传图片至GCS
articleRouter.post("/image/upload/temp", authAdmin, upload.single("image"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  //将文件上传至gcs 将图片url返回给前端
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "未登录用户" });
    }

    const userId = req.user.id.toString();
    const folder = `in-blogs/temp/${userId}`;

    const url = await uploadFileToGCS(req.file, folder);
    res.status(200).json({ url });
  } catch (err) {
    console.error("Upload to GCS error:", (err as Error).message);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 删除临时文件
articleRouter.post("/image/delete", authAdmin, async (req: AuthRequest, res: Response) => {
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

// 上传博客文章
articleRouter.post("/upload-blog", authAdmin, async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body;
  const userId = req.user?.id.toString();

  try {
    // 1. 创建文章
    const newBlog = await Article.create({
      title,
      content,
      author: req.user?.userName || "unknown",
    });


    const blogId = (newBlog._id as mongoose.Types.ObjectId).toString();


    // 2. 移动 temp 文件夹里的图片到 in-blogs/<blogId>
    const tempPrefix = `projects/free-talk/images/in-blogs/temp/${userId}/`;
    const destPrefix = `projects/free-talk/images/in-blogs/${blogId}/`;
    await moveFolder(tempPrefix, destPrefix);

    // 3. 替换文章内容中的图片路径为公开 URL
    const imgRegex = new RegExp(
      `https://storage\\.googleapis\\.com/daniel-jansen7879-bucket-1/projects/free-talk/images/in-blogs/temp/${userId}/([^"?]+)`,
      "g"
    );

    const updatedContent = content.replace(imgRegex, (_: string, filename:string) => {
      return `https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/free-talk/images/in-blogs/${blogId}/${filename}`;
    });

    // 4. 保存更新后的文章内容
    newBlog.content = updatedContent;
    await newBlog.save();

    // 5. 清理 temp 文件夹（可选）
    await deleteFolder(tempPrefix);

    res.status(201).json({ message: "成功添加新文章", newBlog });
  } catch (err) {
    console.error("Finalize blog error:", (err as Error).message);

    // 提交失败 → 清理 temp 文件
    await deleteFolder(`projects/free-talk/images/in-blogs/temp/${userId}/`);
    res.status(500).json({ error: "Failed to save blog" });
  }
});

//获取所有文章列表
articleRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 9
    const total = await Article.countDocuments()
    const blogs = await Article.find()
      .sort({
        createdAt: -1
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    res.status(200).json({
      blogs,
      total,
    })
  } catch (error) {
    console.error('error fetching blogs:', (error as Error).message)
    res.status(500).json({
      error: '获取文章失败'
    })
  }
})

//获取本人文章列表
articleRouter.get('/mine', authAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 9

    if (!req.user) {
      return res.status(401).json({ error: "未登录" });
    }
    const total = await Article.countDocuments({ author: req.user.userName });
    const blogs = await Article.find({ author: req.user.userName })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      blogs,
      total,
      user: req.user
    })
  } catch (error) {
    console.error('error fetching blogs:', (error as Error).message)
    res.status(500).json({
      error: '获取文章失败'
    })
  }
})

// 获取具体文章
articleRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const blog = await Article.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({
        error: '文章不存在'
      })
    }
    const comments = await Promise.all(
      blog.comments.map((commentId) => Comment.findById(commentId))
    )
    res.status(200).json({
      article: blog,
      comments
    })
  } catch (error) {
    console.error('获取文章失败:', (error as Error).message)
    res.status(500).json({
      error: '获取文章失败'
    })
  }
})

// 作者本人更新文章
articleRouter.patch('/update/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body; // tempFiles 是前端传来的文件名数组
  const { id } = req.params;
  const userId = req.user.id.toString();

  try {
    // 1. 查找文章
    const blog = await Article.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "文章不存在" });
    }

    // ✅ 确保是作者本人
    if (blog.author !== req.user.userName) {
      return res.status(403).json({ error: "无权限更新此文章" });
    }

    // 2. 移动图片：temp/<userId> → in-blogs/<id>
    await moveFolder(
      `projects/free-talk/images/in-blogs/temp/${userId}/`,
      `projects/free-talk/images/in-blogs/${id}/`
    );

    // 3. 替换文章内容中的路径
    const updatedContent = content.replace(
      new RegExp(`projects/free-talk/images/in-blogs/temp/${userId}/`, "g"),
      `projects/free-talk/images/in-blogs/${id}/`
    );

    // 4. 更新文章数据
    blog.title = title;
    blog.content = updatedContent;
    const updatedBlog = await blog.save();

    res.status(200).json({ message: '文章更新成功！', blog: updatedBlog });
  } catch (err) {
    console.error('Finalize blog error:', (err as Error).message);


    // 更新失败 → 清理当前用户的 temp
    if (req.user?.id) {
      await deleteFolder(
        `projects/free-talk/images/in-blogs/temp/${req.user.id.toString()}/`
      );
    }
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章，文章评论，文章图片
articleRouter.delete('/delete/:id', authAdmin, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({
      error: '文章编号缺失'
    })
  }
  const folder = `projects/free-talk/images/in-blogs/${id}`;

  try {
    const deletedBlog = await Article.findOneAndDelete({ _id: id, author: req.user.userName }) //只有作者本人可以删除自己的文章
    if (!deletedBlog) {
      return res.status(404).json({ error: '文章不存在或无权限删除' });
    }

    // 删除该文章中的所有评论
    if (deletedBlog.comments.length > 0) {
      await Promise.all(
        deletedBlog.comments.map((id) => Comment.findByIdAndDelete(id))
      )
    }

    // 删除文章中的所有保存在gcs中的图片
    await deleteFolder(folder);

    res.status(200).json({
      message: '文章删除成功'
    })
  } catch (error) {
    console.error('删除文章失败', (error as Error).message)
    res.status(500).json({
      error: '删除文章失败'
    })
  }
})


export default articleRouter;