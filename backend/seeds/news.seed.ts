import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import News from '../models/News'
import Comment from '../models/Comment';
import { deleteFolder } from '../utils/gcsOperating';

export async function seedNews() {
  try {
    console.log("开始清空 News 集合...");
    await News.deleteMany();
    console.log("✅ 所有新闻已清空！");

    // 清空所有关于News的 comments
    await Comment.deleteMany({ type: 'news' })
    console.log("✅ 所有相关评论已清空！");

    //清空所有in-news目录下的所有图片
    const inNews = `projects/free-talk/images/in-news`;
    await deleteFolder(inNews);
    console.log("✅ 所有相关图片已清空！");

    // 生成 100 条随机新闻
    // const newsList = Array.from({ length: 100 }).map(() => ({
    //   title: faker.lorem.sentence(),
    //   content: faker.lorem.paragraphs({ min: 2, max: 5 }),
    //   author: faker.person.fullName(),
    //   source: faker.company.name(),
    // }));

    // // 插入数据库
    // await News.insertMany(newsList);
    // console.log('🎉 已成功插入 100 条新闻');
  } catch (err) {
    console.error('❌ 出错了:', err);
  }
}
