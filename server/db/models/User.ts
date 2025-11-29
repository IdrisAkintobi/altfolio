import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../../../shared/types";
import { AuthUser } from "../../modules/investments/services/investment.service";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

const transformDoc = (_doc: any, ret: any): AuthUser => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  delete ret.passwordHash;
  delete ret.createdAt;
  delete ret.updatedAt;
  return ret;
};

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: "viewer" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: transformDoc },
    toObject: { virtuals: true, transform: transformDoc },
  }
);

export default mongoose.model<IUser>("User", UserSchema);
