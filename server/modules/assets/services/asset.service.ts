import { IAsset } from "../../../db/models/Asset.js";
import { IAssetPerformanceHistory } from "../../../db/models/AssetPerformanceHistory.js";
import { AppError, PaginatedResponse } from "../../../utils/index.js";
import { createPaginationMeta } from "../../../utils/pagination.js";
import {
  AssetRepository,
  AssetData,
  UpdateAssetPerformanceData,
} from "../../../db/repositories/asset.repository.js";

export class AssetService {
  private readonly assetRepository: AssetRepository;

  constructor() {
    this.assetRepository = new AssetRepository();
  }

  async getAllAssetsPaginated(
    page: number,
    limit: number,
    search?: string,
    assetType?: string
  ): Promise<PaginatedResponse<IAsset>> {
    const result = await this.assetRepository.findAllAssets(
      page,
      limit,
      search,
      assetType
    );
    const pagination = createPaginationMeta(page, limit, result.total);

    return {
      items: result.assets,
      pagination,
    };
  }

  async getAllAssets(): Promise<IAsset[]> {
    return await this.assetRepository.findAll();
  }

  async getAssetById(id: string): Promise<IAsset> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw AppError.notFound("Asset not found", { assetId: id });
    }
    return asset;
  }

  async getAssetsByType(assetType: string): Promise<IAsset[]> {
    return await this.assetRepository.findByType(assetType);
  }

  async createAsset(data: AssetData): Promise<IAsset> {
    return await this.assetRepository.createAsset(data);
  }

  async updateAsset(id: string, data: Partial<AssetData>): Promise<IAsset> {
    const asset = await this.assetRepository.updateAsset(id, data);
    if (!asset) {
      throw AppError.notFound("Asset not found", { assetId: id });
    }
    return asset;
  }

  async updateAssetPerformance(
    id: string,
    data: UpdateAssetPerformanceData
  ): Promise<IAsset> {
    const asset = await this.assetRepository.updatePerformance(
      id,
      data.percentageChange
    );
    if (!asset) {
      throw AppError.notFound("Asset not found", { assetId: id });
    }
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.assetRepository.deleteAsset(id);
    if (!asset) {
      throw AppError.notFound("Asset not found", { assetId: id });
    }
  }

  async getAssetPerformanceHistory(
    assetId: string,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<IAssetPerformanceHistory[]> {
    // Verify asset exists
    await this.getAssetById(assetId);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return await this.assetRepository.getPerformanceHistory(
      assetId,
      start,
      end,
      limit
    );
  }
}
