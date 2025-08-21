import readline from "readline";
import dbConnection from '../utils/db'
import mongoose from "mongoose";
import { seedArticles } from './articles.seed'
import { seedComments } from './comments.seed'
import { seedUsers } from './users.seed'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function seed() {
  try {
    await dbConnection()
    rl.question(
      "请选择初始化数据内容:\n1. 用户数据\n2. 评论数据\n3. 文章数据\n4. 所有数据\n请输入编号: ",
      async (choice) => {
        try {
          switch (choice.trim()) {
            case '1':
              await seedUsers()
              break
            case "2":
              await seedComments();
              break;
            case "3":
              await seedArticles();
              break;
            case "4":
              await seedUsers();
              await seedComments();
              await seedArticles();
              break;
            default:
              console.log("❌ 输入无效，请输入 1, 2, 3 或 4");
          }
        } catch (err) {
          console.error("❌ 初始化数据时出错:", err);
        } finally {
          await mongoose.disconnect();
          rl.close();
        }
      }
    )
  } catch (error) {
    console.error('初始化数据失败:', (error as Error).message)
    process.exit(1);
  }
}

seed()