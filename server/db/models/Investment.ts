import mongoose, { Document, Schema } from "mongoose";
import { AssetType } from "../../../shared/types";

export interface IInvestment extends Document {
  assetName: string;
  assetType: AssetType;
  investedAmount: number;
  investmentDate: Date;
  currentValue: number;
  owners: mongoose.Types.ObjectId[];
  updatedAt: Date;
}

const transformDoc = (_doc: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const InvestmentSchema: Schema = new Schema(
  {
    assetName: { type: String, required: true },
    assetType: {
      type: String,
      required: true,
      enum: Object.values(AssetType),
    },
    investedAmount: { type: Number, required: true },
    investmentDate: { type: Date, required: true },
    currentValue: { type: Number, required: true },
    owners: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: transformDoc },
    toObject: { virtuals: true, transform: transformDoc },
  }
);

export default mongoose.model<IInvestment>("Investment", InvestmentSchema);
