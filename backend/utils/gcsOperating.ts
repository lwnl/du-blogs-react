import { Storage } from '@google-cloud/storage';
import dotenv from "dotenv";
dotenv.config();

// 初始化 GCS 客户端
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // 从 .env 读取
});

const bucketName = 'daniel-jansen7879-bucket-1';
const bucket = storage.bucket(bucketName);

const uploadFileToGCS = async (file: Express.Multer.File, folder: string) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const filePath = `projects/my-blog/images/${folder}/${Date.now()}-${file.originalname}`;
      const blob = bucket.file(filePath);

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

const deleteFolder = async (prefix: string) => {
  const [files] = await bucket.getFiles({ prefix });

  if (files.length === 0) {
    console.log(`文件夹为空: ${prefix}`);
    return;
  }
  if (files.length > 0) {
    await Promise.all(files.map((file) => file.delete()));
  }
};

export { bucket, uploadFileToGCS, moveFolder, deleteFolder }