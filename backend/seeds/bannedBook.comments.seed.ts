import BannedBook from "../models/BannedBook";

export async function seedBannedBookComments() {
  try {
    console.log("开始清空禁书评论...");
    const bannedBooks = await BannedBook.find();
    if (bannedBooks.length === 0) {
      console.log("没有需要清空的数据！");
      return
    }

    for (const book of bannedBooks) {
      book.comments = []
      book.ratingResult = 0
      await book.save()
    }

    console.log("✅ 所有书评已清空！");
  } catch (error) {
    console.error("❌ 清除书评失败:", (error as Error).message);
  }
}