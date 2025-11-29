import mongoose, { Document, Schema } from "mongoose";

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  investedAmount: number;
  investmentDate: Date;
  assetPerformanceAtInvestment: number;
}

const transformDoc = (_doc: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const InvestmentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    investedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    investmentDate: {
      type: Date,
      required: true,
    },
    assetPerformanceAtInvestment: {
      type: Number,
      required: true,
      default: 0,
      comment: "Asset performance percentage when this investment was made",
    },
  },
  {
    timestamps: true,
    toJSON: { transform: transformDoc },
    toObject: { transform: transformDoc },
  }
);

// Compound indexes for efficient queries
InvestmentSchema.index({ userId: 1, investmentDate: -1 });
InvestmentSchema.index({ assetId: 1 });

export default mongoose.model<IInvestment>("Investment", InvestmentSchema);
