import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  ApiResponse,
  AppError,
  asyncHandler,
  parsePaginationParams,
  logger,
  AppLogger,
} from "../../../utils/index.js";
import { AssetService } from "../services/asset.service.js";

export class AssetController {
  private readonly assetService: AssetService;

  private logger: AppLogger;

  constructor() {
    this.assetService = new AssetService();
    this.logger = logger.createModuleLogger(AssetController.name)
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = parsePaginationParams(req.query);
    const search = req.query.search as string | undefined;
    const assetType = req.query.assetType as string | undefined;
    const result = await this.assetService.getAllAssetsPaginated(page, limit, search, assetType);
    ApiResponse.paginated(res, result, "Assets retrieved successfully");
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const asset = await this.assetService.getAssetById(id);
    ApiResponse.success(res, asset, "Asset retrieved successfully");
  });

  getByType = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { type } = req.params;
      const assets = await this.assetService.getAssetsByType(type);
      ApiResponse.success(res, assets, "Assets retrieved successfully");
    }
  );

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw AppError.validationError("Validation failed", {
        errors: errors.array(),
      });
    }

    const asset = await this.assetService.createAsset(req.body);
    const assetObj = asset.toObject();
    
    this.logger.audit(req, 'CREATE_ASSET', {
      resource: 'asset',
      resourceId: assetObj.id,
      metadata: { ...req.body },
    });
    
    ApiResponse.created(res, asset, "Asset created successfully");
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw AppError.validationError("Validation failed", {
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const asset = await this.assetService.updateAsset(id, req.body);
    
    this.logger.audit(req, 'UPDATE_ASSET', {
      resource: 'asset',
      resourceId: id,
      changes: Object.keys(req.body),
      metadata: { ...req.body },
    });
    
    ApiResponse.success(res, asset, "Asset updated successfully");
  });

  updatePerformance = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw AppError.validationError("Validation failed", {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const asset = await this.assetService.updateAssetPerformance(
        id,
        req.body
      );
      
      this.logger.audit(req, 'UPDATE_ASSET_PERFORMANCE', {
        resource: 'asset',
        resourceId: id,
        metadata: { ...req.body },
      });
      
      ApiResponse.success(res, asset, "Asset performance updated successfully");
    }
  );

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const asset = await this.assetService.deleteAsset(id);
    const assetObj = asset.toObject();
    
    this.logger.audit(req, 'DELETE_ASSET', {
      resource: 'asset',
      resourceId: assetObj.id,
      metadata: {
        assetName: assetObj.assetName,
        assetType: assetObj.assetType,
      },
    });
    
    ApiResponse.success(res, null, "Asset deleted successfully");
  });

  getPerformanceHistory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const { startDate, endDate, limit } = req.query;

      const history = await this.assetService.getAssetPerformanceHistory(
        id,
        startDate as string | undefined,
        endDate as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );

      ApiResponse.success(
        res,
        history,
        "Performance history retrieved successfully"
      );
    }
  );
}
