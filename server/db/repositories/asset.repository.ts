import Asset, { IAsset } from "../models/Asset.js";
import AssetPerformanceHistory, {
  IAssetPerformanceHistory,
} from "../models/AssetPerformanceHistory.js";
import { type AssetType } from "../../../shared/types.js";
import { BaseRepository } from "./base.repository.js";

export interface AssetData {
  assetName: string;
  assetType: AssetType;
  currentPerformance?: number;
}

export interface UpdateAssetPerformanceData {
  percentageChange: number;
}

export interface PaginatedAssets {
  assets: IAsset[];
  total: number;
}

export class AssetRepository extends BaseRepository<IAsset> {
  constructor() {
    super(Asset);
  }

  async findAllAssets(
    page: number,
    limit: number,
    search?: string,
    assetType?: string
  ): Promise<PaginatedAssets> {
    const query: any = {};

    if (search) {
      query.assetName = { $regex: search, $options: "i" };
    }

    if (assetType && assetType !== "All") {
      query.assetType = assetType;
    }

    const result = await this.findAllPaginated(query, page, limit);
    return { assets: result.items, total: result.total };
  }

  async findByType(assetType: string): Promise<IAsset[]> {
    return await this.findAll({ assetType });
  }

  async createAsset(data: AssetData): Promise<IAsset> {
    return await this.withTransaction(async (session) => {
      const asset = new Asset({
        ...data,
        currentPerformance: data.currentPerformance || 0,
        lastUpdated: new Date(),
      });
      const savedAsset = await asset.save({ session });

      await AssetPerformanceHistory.create(
        [
          {
            assetId: savedAsset._id,
            date: new Date(),
            percentageChange: savedAsset.currentPerformance,
          },
        ],
        { session }
      );

      return savedAsset;
    });
  }

  async updateAsset(
    id: string,
    data: Partial<AssetData>
  ): Promise<IAsset | null> {
    return await this.update(id, { ...data, lastUpdated: new Date() });
  }

  async updatePerformance(
    id: string,
    percentageChange: number
  ): Promise<IAsset | null> {
    return await this.withTransaction(async (session) => {
      const asset = await Asset.findByIdAndUpdate(
        id,
        {
          currentPerformance: percentageChange,
          lastUpdated: new Date(),
        },
        { new: true, session }
      );

      if (asset) {
        await AssetPerformanceHistory.create(
          [
            {
              assetId: asset._id,
              date: new Date(),
              percentageChange,
            },
          ],
          { session }
        );
      }

      return asset;
    });
  }

  async deleteAsset(id: string): Promise<IAsset | null> {
    return await this.withTransaction(async (session) => {
      const asset = await Asset.findById(id).session(session);
      if (!asset) {
        return null;
      }

      const Investment = (await import("../models/Investment.js")).default;

      await AssetPerformanceHistory.deleteMany({ assetId: id }).session(
        session
      );
      await Investment.deleteMany({ assetId: id }).session(session);
      await asset.deleteOne({ session });

      return asset;
    });
  }

  async getPerformanceHistory(
    assetId: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number
  ): Promise<IAssetPerformanceHistory[]> {
    const query: any = { assetId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    let queryBuilder = AssetPerformanceHistory.find(query).sort({ date: -1 });

    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    return await queryBuilder.exec();
  }
}
