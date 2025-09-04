import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import dbConnection from './utils/db';
import userRouter from './routers/userRouter';
import articleRouter from './routers/articleRouter';
import commentRouter from './routers/commentRouter';
import bannedBookRouter from './routers/bannedBookRouter';

dotenv.config();
dbConnection();

const app = express();
const __dirname = path.resolve();

app.use(express.json());
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));
app.use(cookieParser());

// 1️⃣ API 路由
app.use('/api/users', userRouter);
app.use('/api/comments', commentRouter);
app.use('/api/banned-books', bannedBookRouter);
app.use('/api/articles', articleRouter);

// 2️⃣ 前端静态文件托管
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 所有非 /api 路径且不以 /assets 开头的请求都返回 index.html
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});