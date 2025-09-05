import mongoose from "mongoose";
import Article from "../models/Article";
import Comment from "../models/Comment";

export async function seedArticles() {
  try {
    console.log("开始清空 User 集合...");
    const allArticles = await Article.find()
    for (const articleItem of allArticles) {
      //清除所有comments
      for (const commentId of articleItem.comments ){
        await Comment.findByIdAndDelete(commentId)
      }
    }
    await Article.deleteMany();
    console.log("✅ 所有文章已清空！");

    await mongoose.disconnect();
    console.log("🔌 已断开数据库连接");
  } catch (error) {
    console.error("❌ 清空文章失败:", (error as Error).message);
    process.exit(1);
  }
}