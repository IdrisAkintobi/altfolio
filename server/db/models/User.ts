import mongoose, { Document, Schema } from 'mongoose';
import { type User, UserRole } from '@shared/types';

export interface IUser extends Document {
  email: string;
  role: UserRole;
  name: string;
  passwordHash: string;
}

const transformDoc = (_doc: any, ret: any): User => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  delete ret.passwordHash;
  delete ret.updatedAt;
  return ret;
};

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.VIEWER },
  },
  {
    timestamps: true,
    toJSON: { transform: transformDoc },
    toObject: { transform: transformDoc },
  }
);

export default mongoose.model<IUser>('User', UserSchema);
