import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IArticle extends Document {
  title: string;
  content: string;
  createdAt: Date;
}

const ArticleSchema: Schema<IArticle> = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)

export default Article 