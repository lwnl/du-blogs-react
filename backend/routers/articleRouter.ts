import express from 'express'
import type { Response } from 'express'
import { auth } from '../utils/auth'
import type { AuthRequest } from '../utils/auth'
import multer from 'multer'
import { uploadFileToGCS } from '../utils/uploadFileToGCS'

const articleRouter = express.Router()

const upload = multer({
  storage: multer.memoryStorage(), // 存内存，方便直接上传 GCS
});

articleRouter.post("/uploads", auth, upload.single("image"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const url = await uploadFileToGCS(req.file);
    res.json({ imageUrl: url });
  } catch (err) {
    console.error('GCS Upload Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default articleRouter;