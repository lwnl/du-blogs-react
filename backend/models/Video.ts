import mongoose, { Schema, Document, Model } from 'mongoose'
import { jsonDateTransform } from '../utils/formatDate'

export interface IVideo extends Document {
  title: string;
  comments: string[];
  category: string;
  url: string;
  createdAt: Date;
  updateAt: Date;
}

const VideoSchema: Schema<IVideo> = new Schema({
  title: {
    type: String,
    required: true
  },
  comments: {
    type: [String], default: []
  },
  category: {
    type: String,
  },
  url: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

VideoSchema.set('toJSON', {
  transform: jsonDateTransform
});

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema)

export default Video