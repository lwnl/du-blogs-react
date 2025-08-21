import Comment from "../models/Comment";

export async function seedComments() {
  try {
    console.log("开始清空 Comment 集合...");
    await Comment.deleteMany()
    console.log("✅ 所有评论已清空！");
  } catch (error) {
    console.error("❌ 清空用户失败:", (error as Error).message);
  }
}