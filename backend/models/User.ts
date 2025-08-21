import mongoose, { Schema, Document, Model } from 'mongoose'

export enum UserRole {
  Guest = "Guest",
  RegisteredUser = "Registered User",
  Admin = "Administrator"
}

export interface IUser extends Document {
  userName: string
  password: string
  role: UserRole
}

const UserSchema: Schema<IUser> = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
  },

  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.Guest,
  }, 
}, 

{
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
})

const User:Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User