import mongoose, { Schema, Document, Model } from 'mongoose'
import { jsonDateTransform } from '../utils/formatDate';

export interface IComment extends Document {
  subjectId: string,
  content: string,
  author: string,
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

  author: {
    type: String,
    required: true
  },
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