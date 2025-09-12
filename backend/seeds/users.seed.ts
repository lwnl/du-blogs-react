import User from "../models/User";


export async function seedUsers() {
  try {
    console.log("开始清空 User 集合...");
    await User.deleteMany();
    console.log("✅ 所有用户已清空！");
  } catch (error) {
    console.error("❌ 清空用户失败:", (error as Error).message);
  } 
}