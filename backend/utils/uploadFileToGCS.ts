import { Storage } from '@google-cloud/storage';
import dotenv from "dotenv";
dotenv.config();

// 初始化 GCS 客户端
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // 从 .env 读取
});

console.log('googleStorage is', storage)

const bucketName = 'daniel-jansen7879-bucket-1';
export const bucket = storage.bucket(bucketName);

export const uploadFileToGCS = async (file: Express.Multer.File) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filePath = `projects/my-blog/images/in-blogs/${Date.now()}-${file.originalname}`;
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on('error', (err) => {
        reject(err);
      });

      blobStream.on('finish', async () => {
        // ✅ 生成签名 URL（长期有效）
        const [url] = await blob.getSignedUrl({
          action: 'read',
          expires: '2099-01-01',
        });
        resolve(url); // 返回 URL 给前端
      });

      blobStream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });
};