import mongoose, { Schema, Document, Model } from 'mongoose';
import { jsonDateTransform } from '../utils/formatDate';


export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  comments: string[];
  keyWords: string[];
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
  },
  comments: {
    type: [String], default: []
  },
  keyWords: {
    type: [String], default: []
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

ArticleSchema.set('toJSON', {
  transform: jsonDateTransform
});

const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)

export default Article 