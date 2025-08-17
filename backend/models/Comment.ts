import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IComment extends Document {
  subjectId: string,
  content: string,
  author: string,
  createdAt: Date;
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
  }
})

CommentSchema.set('toJSON', {
  transform: function (doc, ret: any) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (ret.createdAt) {
      ret.createdAt = new Date(ret.createdAt).toLocaleDateString('zh-CN', options);
    }
    return ret;
  }
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)

export default Comment