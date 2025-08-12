import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date; 
}

const ArticleSchema: Schema<IArticle> = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

ArticleSchema.set('toJSON', {
  transform: function (doc, ret: any) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (ret.createdAt) {
      ret.createdAt = new Date(ret.createdAt).toLocaleDateString('zh-CN', options);
    }
    if (ret.updatedAt) {
      ret.updatedAt = new Date(ret.updatedAt).toLocaleDateString('zh-CN', options);
    }
    return ret;
  }
});

const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)

export default Article 