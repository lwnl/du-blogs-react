import readline from "readline";
import dbConnection from '../utils/db'
import mongoose from "mongoose";
import { seedArticles } from './articles.seed'
import { seedComments } from './comments.seed'
import { seedUsers } from './users.seed'
import { seedBannedBook } from "./bannedBook.seed";
import { seedBannedBookComments } from "./bannedBook.comments.seed";
import { authAdmin } from "./authAdmin.seed";
import { disAuthAdmin } from "./disAuthAdmin";
import { seedNews } from "./news.seed";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function seed() {
  try {
    await dbConnection()
    rl.question(
      "请选择初始化数据内容:\n3. 初始化博客数据\n4. 初始化禁书数据\n6. 初始化新闻数据\n7. 授权管理员\n8. 取消管理员\n请输入编号: ",
      async (choice) => {
        try {
          switch (choice.trim()) {
            // case '1':
            //   await seedUsers()
            //   await disconnection();
            //   break
            // case "2":
            //   await seedComments();
            //   await disconnection();
            //   break;
            case "3":
              await seedArticles();
              await disconnection();
              break;
            case "4":
              await seedBannedBook()
              await disconnection();
              break;
            // case "5":
            //   await seedBannedBookComments()
            //   await disconnection();
            //   break;
            case "6":
              await seedNews() 
              await disconnection();
              break;
            case "7":
              rl.question("请输入要授权为管理员的用户名: ", (username) => {
                authAdmin(username.trim())
                  .catch(err => console.error("❌ 授权失败:", err))
                  .finally(() => disconnection());
              });
              return;

            case "8":
              rl.question("请输入要取消管理员权限的用户名: ", (username) => {
                disAuthAdmin(username.trim())
                  .catch(err => console.error("❌ 操作失败:", err))
                  .finally(() => disconnection());
              });
              return;
            // case "9":
            //   await seedUsers();
            //   await seedArticles();
            //   await seedBannedBook()
            //   await seedComments()
            //   await disconnection();
            //   break;
            default:
              console.log("❌ 输入无效，请输入数字1-8");
              await disconnection();
          }
        } catch (err) {
          console.error("❌ 初始化数据时出错:", err);
          await disconnection();
        }
      }
    )
  } catch (error) {
    console.error('初始化数据失败:', (error as Error).message)
    process.exit(1);
  }
}

const disconnection = async () => {
  await mongoose.disconnect();
  console.log("🔌 已断开数据库连接");
  rl.close();
};

seed()