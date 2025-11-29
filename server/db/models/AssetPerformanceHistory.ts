import mongoose, { Document, Schema } from "mongoose";

export interface IAssetPerformanceHistory extends Document {
  assetId: mongoose.Types.ObjectId;
  date: Date;
  percentageChange: number;
}

const transformDoc = (_doc: any, ret: any) => {
  delete ret._id;
  delete ret.__v;
  return ret;
};

const AssetPerformanceHistorySchema: Schema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    percentageChange: {
      type: Number,
      required: true,
      comment: "Percentage change from initial value at this point in time",
    },
  },
  {
    timestamps: false,
    toJSON: { transform: transformDoc },
    toObject: { transform: transformDoc },
  }
);

// Compound index for efficient queries by asset and date range
AssetPerformanceHistorySchema.index({ assetId: 1, date: -1 });

export default mongoose.model<IAssetPerformanceHistory>(
  "AssetPerformanceHistory",
  AssetPerformanceHistorySchema
);
