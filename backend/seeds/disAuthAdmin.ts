// disAuthAdmin.ts
import User from "../models/User";

export async function disAuthAdmin(userName: string) {
  try {
    const user = await User.findOne({ userName });

    if (!user) {
      console.log("❌ 未找到该用户");
    } else {
      if (user.role !== "Administrator") {
        console.log(`ℹ️ 用户 ${userName} 不是 Administrator`);
      } else {
        user.role = "Registered User";
        await user.save();
        console.log(`✅ 用户 ${userName} 已取消管理员权限`);
      }
    }
  } catch (err) {
    console.error("❌ 取消管理员时出错:", err);
  }
}