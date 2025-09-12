// authAdmin.seed.ts
import User from "../models/User";

export async function authAdmin(userName: string) {
  try {
    const user = await User.findOne({ userName });

    if (!user) {
      console.log("❌ 未找到该用户");
    } else {
      if (user.role === "Administrator") {
        console.log(`ℹ️ 用户 ${userName} 已经是 Administrator`);
      } else {
        user.role = "Administrator";
        await user.save();
        console.log(`✅ 用户 ${userName} 已成功提升为 Administrator`);
      }
    }
  } catch (err) {
    console.error("❌ 授权管理员时出错:", err);
  }
}