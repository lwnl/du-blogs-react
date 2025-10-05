import mongoose, { Schema, Document, Model } from 'mongoose'
import { jsonDateTransform } from '../utils/formatDate';

export interface IComment extends Document {
  subjectId: string,
  content: string,
  user: string,
  type: "news" | "blog" | "video",
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema({
  subjectId: {
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

  type: {
    type: String,
    required: true,
    enum: ['news', 'blog', 'video']
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

CommentSchema.set('toJSON', {
  transform: jsonDateTransform
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)

export default Comment