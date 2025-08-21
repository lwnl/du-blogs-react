import mongoose, { Document, Schema, Model } from 'mongoose'
import { jsonDateTransform } from '../utils/formatDate';

export interface IBannedBook extends Document {
  bookName: string,
  format: string,
  review: number,
  summary: string,
  comments: string[],
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema<IBannedBook> = new Schema({
  bookName: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  review: {
    type: Number,
  },
  summary: {
    type: String,
    required: true,
  },
  comments: {
    type: [String]
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