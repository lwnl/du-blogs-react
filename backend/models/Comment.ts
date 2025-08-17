import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IComment extends Document {
  commentType: 'blogComment' | 'followUpComment',
  subjectId: string,
  content: string,
  author: string,
  createdAt: Date;
  updatedAt: Date;
  followUpCommentsId: string[]
}

const CommentSchema: Schema<IComment> = new Schema({
  commentType: {
    type: String,
    enum: ['blogComment', 'followUpComment'],
    required: true
  },

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

  followUpCommentsId: {
    type: [String]
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
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
    if (ret.updatedAt) {
      ret.updatedAt = new Date(ret.updatedAt).toLocaleDateString('zh-CN', options);
    }
    return ret;
  }
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)

export default Comment