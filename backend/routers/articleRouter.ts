import express from 'express'
import type { Request, Response } from 'express'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'
import multer from 'multer'
import { uploadFileToGCS } from '../utils/uploadFileToGCS'
import Article from '../models/Article'
import { tempDir } from '../utils/tempDir';
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()
const PORT = process.env.PORT
const HOST = `http://localhost:${PORT}`

const articleRouter = express.Router()

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
  }),
});

articleRouter.post("/temp-uploads", auth, upload.single("image"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // 临时 URL（直接暴露静态目录给前端访问）
  const tempUrl = `${req.protocol}://${req.get('host')}/temp/${req.file.filename}`;
  res.json({ tempUrl, tempFilename: req.file.filename });
});

// 删除临时文件
articleRouter.post("/temp-uploads/delete", auth, async (req: AuthRequest, res: Response) => {
  const { filename } = req.body;


  if (!filename) {
    return res.status(400).json({ error: "缺少文件名参数" });
  }

  try {
    const filePath = path.join(tempDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: "Temp file deleted successfully" });
    }
    return res.status(404).json({ error: "文件不存在或已被删除" });
  } catch (err) {
    console.error("Delete temp file error:", (err as Error).message);
    return res.status(500).json({ error: "Failed to delete temp file" });
  }
});

// 提交时批量上传到 GCS
articleRouter.post('/upload', auth, async (req: AuthRequest, res: Response) => {
  const { title, content, tempFiles } = req.body; // tempFiles 是前端传来的文件名数组

  let finalContent = content;

  try {
    // 上传临时文件到 GCS，并替换 URL
    for (const filename of tempFiles || []) {
      const filePath = path.join(tempDir, filename);

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = 'image/' + path.extname(filename).slice(1);

        const gcsUrl = await uploadFileToGCS({
          buffer: fileBuffer,
          originalname: filename,
          mimetype: mimeType,
        } as any);

        // 替换 HTML 中的临时 URL
        finalContent = finalContent.replace(`${HOST}/temp/${filename}`, gcsUrl);

        // 删除临时文件
        fs.unlinkSync(filePath);
      }
    }

    // 保存到 MongoDB
    await Article.create({
      title,
      content: finalContent,
      author: req.user?.useName || 'unknown', // 假设 auth 中挂载了 req.user
    })

    res.status(201).json({ message: 'Blog created successfully' });
  } catch (err) {
    console.error('Finalize blog error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

//获取文章列表
articleRouter.get('/', async (req: Request, res: Response) => {
  try {
    const blogs = await Article.find().sort({
      createdAt: -1
    })

    res.status(200).json({
      blogs
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



export default articleRouter;