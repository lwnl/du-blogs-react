import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dbConnection from './utils/db'

dotenv.config()

const app = express()

app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(cookieParser())

dbConnection()

const PORT = process.env.PORT || 3300

app.listen(PORT, () => { 
   console.log(`Server running on http://localhost:${PORT}`);
 })