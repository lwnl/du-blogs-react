import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import BannedBook from "../models/BannedBook";
import type { AuthRequest } from './auth';

// 预检中间件：检查书籍和评论是否存在 & 是否为本人
export const idChecking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { bookId, commentId } = req.params;

  try {
    const book = await BannedBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "书籍不存在" });
    }

    const comment = book.comments.find((c) => c._id?.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ error: "评论不存在" });
    }

    if (req.user.userName !== comment.author) {
      return res.status(403).json({ error: "只能操作本人的评论" });
    }

    // 挂到 req 上，后续中间件/路由直接用
    (req as any).book = book;
    (req as any).comment = comment;

    next();
  } catch (error) {
    console.error("预检失败:", (error as Error).message);
    res.status(500).json({ error: "预检失败" });
  }
};