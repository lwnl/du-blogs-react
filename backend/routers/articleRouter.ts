import express from 'express'
import type { Request, Response } from 'express'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'
import multer from 'multer'
import { bucket, uploadFileToGCS } from '../utils/uploadFileToGCS'
import Article from '../models/Article'
import { authOptional } from '../utils/authOptional'

const articleRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });

//上传图片至GCS
articleRouter.post("/image/upload", auth, upload.single("image"), async (req: AuthRequest, res: Response) => {
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
articleRouter.post("/image/delete", auth, async (req: AuthRequest, res: Response) => {
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
articleRouter.post('/upload-blog', auth, async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body;

  try {
    // 保存到 MongoDB
    await Article.create({
      title,
      content,
      author: req.user?.userName || 'unknown', // 假设 auth 中挂载了 req.user
    })
    res.status(201).json({ message: 'Blog created successfully' });
  } catch (err) {
    console.error('Finalize blog error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

//获取所有文章列表
articleRouter.get('/', authOptional, async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.user ? { author: req.user.userName } : {}
    const blogs = await Article.find(filter).sort({
      createdAt: -1
    })

    res.status(200).json({
      blogs,
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
    res.status(200).json({
      blog
    })
  } catch (error) {
    console.error('error fetching blog:', (error as Error).message)
    res.status(500).json({
      error: '获取文章失败'
    })
  }
})

// 作者本人更新文章
articleRouter.patch('/update/:id', auth, async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body; // tempFiles 是前端传来的文件名数组
  try {
    // 保存到 MongoDB
    const updatedBlog = await Article.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userName }, //只能更新自己的文章
      {
        title,
        content,
      },
      { new: true }// 返回更新后的文档
    )
    if (!updatedBlog) {
      return res.status(404).json({ error: '文章不存在或无权限更新' });
    }
    res.status(200).json({ message: '文章更新成功！', blog: updatedBlog });
  } catch (err) {
    console.error('Finalize blog error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

// 追加评论
articleRouter.patch('update-comments/:id', auth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  const { newCommentId } = req.body

  const updatedBlog = await Article.findByIdAndUpdate(
    id,
    { $push: { comments: newCommentId }, },
    { new: true }// 返回更新后的文档
  )

  if (!updatedBlog) {
    return res.status(404).json({
      message: '文章不存在'
    })
  }
  res.status(200).json({ message: '评论追加成功', blog: updatedBlog });
})

// 删除文章
articleRouter.delete('/delete/:id', auth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({
      error: '文章编号缺失'
    })
  }

  try {
    const deletedBlog = await Article.findOneAndDelete({ _id: id, author: req.user.userName }) //只有作者本人可以删除自己的文章
    if (!deletedBlog) {
      return res.status(404).json({ error: '文章不存在或无权限删除' });
    }
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