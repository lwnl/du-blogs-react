import mongoose from "mongoose";
import Article from "../models/Article";
import Comment from "../models/Comment";
import { deleteImagesFromContent } from "../utils/gcsOperating";

// 随机生成标题和内容的函数
function getRandomTitle(): string {
  const adjectives = ["新", "有趣的", "精彩的", "神秘的", "重要的"];
  const nouns = ["文章", "故事", "教程", "新闻", "发现"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun} ${Math.floor(Math.random() * 1000)}`;
}

function getRandomContent(): string {
  const sentences = [
    "这是第一句示例内容。",
    "这里有一些随机生成的文章内容。",
    "今天的天气非常好，适合写文章。",
    "内容可以包括多种信息，比如教程或者故事。",
    "希望你喜欢这篇随机生成的文章。"
  ];
  let content = "";
  for (let i = 0; i < 5; i++) {
    content += sentences[Math.floor(Math.random() * sentences.length)] + " ";
  }
  return content.trim();
}

function getRandomAuthor(): string {
  const authors = ["Alice", "Bob", "Charlie", "David", "Eve"];
  return authors[Math.floor(Math.random() * authors.length)] || "Alice";
}

export async function seedArticles() {
  try {
    console.log("开始清空 Article 集合...");
    const allArticles = await Article.find();
    for (const articleItem of allArticles) {
      // 清除所有 comments
      for (const commentId of articleItem.comments) {
        await Comment.findByIdAndDelete(commentId);
      }

      await deleteImagesFromContent(articleItem.content);
    }
    await Article.deleteMany();
    console.log("✅ 所有文章已清空！");

    // 随机生成 100 篇文章
    // const newArticles = [];
    // for (let i = 0; i < 100; i++) {
    //   newArticles.push({
    //     title: getRandomTitle(),
    //     content: getRandomContent(),
    //     author: getRandomAuthor(),
    //     comments: []
    //   });
    // }

    // await Article.insertMany(newArticles);
    // console.log("✅ 已成功创建 100 篇随机文章！");

  } catch (error) {
    console.error("❌ 清空文章失败:", (error as Error).message);
    process.exit(1);
  }
}