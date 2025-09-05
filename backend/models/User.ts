import mongoose, { Schema, Document, Model } from 'mongoose'


export interface IUser extends Document {
  userName: string
  password: string
  role: "Guest" | "Registered User" | "Administrator"
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
    enum: ["Guest", "Registered User", "Administrator"],
    default: "Guest",
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