import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDownload extends Document {
  title: string;
}

const DownloadSchema: Schema<IDownload> = new Schema({
  title: {
    type: String,
    required: true
  }
}, {
  timestamps:{
    createdAt: true,
    updatedAt: true
  }
})

const Download: Model<IDownload> = mongoose.models.Download || mongoose.model<IDownload>('Download', DownloadSchema)

export default Download