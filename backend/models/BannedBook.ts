import mongoose, { Document, Schema, Model } from 'mongoose'
import { jsonDateTransform } from '../utils/formatDate';

interface IComment {
  author: string;
  content: string;
}

export interface IBannedBook extends Document {
  bookName: string,
  coverLink: string,
  downloadLink: string,
  format: string,
  review: string,
  summary: string,
  comments: IComment[],
  createdAt: Date;
  updatedAt: Date;
}

// 子 Schema：评论
const CommentSchema = new Schema<IComment>({
  author: { type: String, required: true },
  content: { type: String, required: true }
});

const BookSchema: Schema<IBannedBook> = new Schema({
  bookName: {
    type: String,
    required: true,
  },
  coverLink: {
    type: String,
    required: true,
  },
  downloadLink: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  review: {
    type: String,
  },
  summary: {
    type: String,
    required: true,
  },
  comments: {
    type: [CommentSchema], default: []
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

BookSchema.set('toJSON', {
  transform: jsonDateTransform
});

const BannedBook: Model<IBannedBook> = mongoose.models.Book || mongoose.model<IBannedBook>('Book', BookSchema)

export default BannedBook