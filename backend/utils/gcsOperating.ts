import { Storage } from '@google-cloud/storage';
import dotenv from "dotenv";
dotenv.config();

// 初始化 GCS 客户端
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // 从 .env 读取
});

console.log('googleStorage is', storage)

const bucketName = 'daniel-jansen7879-bucket-1';
const bucket = storage.bucket(bucketName);

const uploadFileToGCS = async (file: Express.Multer.File) => {
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

/**
 * 从文章内容中提取 GCS 图片 URL 并删除
 * 只会删除存储在 GCS 上的图片，外部网络图片不会删除
 * 
 * @param content - 文章内容字符串
 */
const deleteImagesFromContent = async (content: string): Promise<void> => {
  if (!content) return;

  // 匹配文章中所有 URL
  const imageUrls: string[] = content.match(/https?:\/\/[^\s")']+/g) || [];

  // GCS 上传路径前缀（与 uploadFileToGCS 中 filePath 对应）
  const gcsPrefix = '/projects/my-blog/images/in-blogs/';

  // 过滤出 GCS 图片
  const gcsUrls: string[] = imageUrls.filter(url => {
    try {
      const pathname = new URL(url).pathname;
      return pathname.includes(gcsPrefix);
    } catch {
      return false;
    }
  });

  if (gcsUrls.length === 0) return;

  // 批量删除 GCS 图片
  await Promise.all(
    gcsUrls.map(async (url: string) => {
      try {
        // 提取 GCS 对象路径
        const objectPath = decodeURIComponent(
          new URL(url).pathname.replace(/^\/[^/]+\//, '')
        );
        await bucket.file(objectPath).delete();
        console.log(`已删除 GCS 图片: ${objectPath}`);
      } catch (err) {
        console.error(`删除 GCS 图片失败: ${url}`, (err as Error).message);
      }
    })
  );
};

export {bucket, uploadFileToGCS, deleteImagesFromContent}