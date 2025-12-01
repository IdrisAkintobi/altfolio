import mongoose, { Document, Schema } from 'mongoose';
import { AssetType } from '@shared/types';

export interface IAsset extends Document {
  assetName: string;
  assetType: AssetType;
  currentPerformance: number;
  lastUpdated: Date;
  isListed: boolean;
}

const transformDoc = (_doc: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const AssetSchema: Schema = new Schema(
  {
    assetName: { type: String, required: true },
    assetType: {
      type: String,
      required: true,
      enum: Object.values(AssetType),
    },
    currentPerformance: {
      type: Number,
      required: true,
      default: 0,
      comment: 'Percentage change from initial value',
    },
    lastUpdated: { type: Date, required: true, default: Date.now },
    isListed: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    toJSON: { transform: transformDoc },
    toObject: { transform: transformDoc },
  }
);

// Indexes
AssetSchema.index({ assetType: 1 });
AssetSchema.index({ assetName: 1 });

export default mongoose.model<IAsset>('Asset', AssetSchema);
