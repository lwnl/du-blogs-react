import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dbConnection from './utils/db'
import userRouter from './routers/userRouter'
import articleRouter from './routers/articleRouter'
import commentRouter from './routers/commentRouter'
import bannedBookRouter from './routers/bannedBookRouter'

dotenv.config()

dbConnection()

const app = express()

app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(cookieParser())

app.use('/users', userRouter)
app.use('/articles', articleRouter)
app.use('/comments', commentRouter)
app.use('/banned-books', bannedBookRouter)

// 允许浏览器通过 /temp/... 访问临时文件

const PORT = process.env.PORT || 3300

app.listen(PORT, () => { 
  console.log(`Server running on http://localhost:${PORT}`);
 })