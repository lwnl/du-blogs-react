import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  userName: string
  password: string
}

const UserSchema: Schema<IUser> = new Schema({
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

const User:Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User