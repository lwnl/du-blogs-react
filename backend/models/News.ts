import mongoose, { Schema, Model, Document } from 'mongoose'
import { jsonDateTransform } from '../utils/formatDate';

export interface INews extends Document {
  title: string,
  content: string,
  user: string,
  source: string,
  comments: string[],
  createdAt: Date,
  updatedAt: Date
}

const NewsSchema: Schema<INews> = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  comments: {
    type: [String], default: []
  },
}, {
  timestamps: {
    createdAt: true,
    updateAt:true
  }
})

NewsSchema.set('toJSON', {
  transform: jsonDateTransform
});

const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema)

export default News
