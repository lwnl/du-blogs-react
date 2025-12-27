import { Storage } from '@google-cloud/storage';
import dotenv from "dotenv";
dotenv.config();

// 初始化 GCS 客户端
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // 从 .env 读取
});

const bucketName = process.env.GCS_BUCKET_NAME;
if (!bucketName) {
  throw new Error('GCS_BUCKET_NAME is not defined');
}

const bucket = storage.bucket(bucketName);

//上传文件
const uploadFileToGCS = async (file: Express.Multer.File, folder: string) => {
  const filePath = `projects/free-talk/images/${folder}/${Date.now()}-${file.originalname}`;
  const blob = bucket.file(filePath);

  return new Promise<string>(async (resolve, reject) => {
    try {

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on("error", (err) => {
        reject(err);
      });

      blobStream.on("finish", () => {
        // 直接生成公开 URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });
};

// 在不同文件夹之间移动文件
const moveFolder = async (srcPrefix: string, destPrefix: string) => {
  const [files] = await bucket.getFiles({ prefix: srcPrefix });



  await Promise.all(
    files.map(async (file) => {
      const destPath = file.name.replace(srcPrefix, destPrefix);
      await bucket.file(file.name).copy(bucket.file(destPath));
      await bucket.file(file.name).delete();
    })
  );
};

// 删除文件夹
const deleteFolder = async (prefix: string) => {
  const [files] = await bucket.getFiles({ prefix });

  if (files.length === 0) {
    console.log(`文件夹为空: ${prefix}`);
    return;
  }

  await Promise.all(files.map((file) => file.delete()));
};

// 根据公共 URL 删除文件
const deleteFileByUrl = async (publicUrl: string) => {
  // 公共 URL 格式: https://storage.googleapis.com/<bucket>/<filePath>
  const url = new URL(publicUrl);
  const pathname = url.pathname; // /<bucket>/<filePath>
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length < 2) {
    throw new Error('URL 格式不正确');
  }

  const bucketFromUrl = parts[0];
  const filePath = parts.slice(1).join('/');

  if (bucketFromUrl !== bucket.name) {
    throw new Error('URL 对应的 bucket 不匹配');
  }

  await bucket.file(filePath).delete();
};

export { bucket, uploadFileToGCS, moveFolder, deleteFolder, deleteFileByUrl }