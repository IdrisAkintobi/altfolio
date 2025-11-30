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
import { InvestmentService } from "../services/investment.service.js";

export class InvestmentController {
  private readonly investmentService: InvestmentService;

  private readonly logger: AppLogger;

  constructor() {
    this.investmentService = new InvestmentService();
    this.logger = logger.createModuleLogger(InvestmentController.name)
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = parsePaginationParams(req.query);
    const assetId = req.query.assetId as string | undefined;
    const userId = req.query.userId as string | undefined;
    
    const filters = {
      ...(assetId && { assetId }),
      ...(userId && { userId }),
    };
    
    const result = await this.investmentService.getAllInvestmentsPaginated(
      req.user,
      page,
      limit,
      Object.keys(filters).length > 0 ? filters : undefined
    );
    ApiResponse.paginated(res, result, "Investments retrieved successfully");
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const investment = await this.investmentService.getInvestmentById(
      id,
      req.user
    );
    ApiResponse.success(res, investment, "Investment retrieved successfully");
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw AppError.validationError("Validation failed", {
        errors: errors.array(),
      });
    }

    const investment = await this.investmentService.createInvestment(
      req.body,
      req.user
    );
    const investmentObj = investment.toObject();
    const asset = investmentObj.assetId as any;
    
    this.logger.audit(req, 'CREATE_INVESTMENT', {
      resource: 'investment',
      resourceId: investmentObj.id,
      metadata: { ...req.body },
    });
    
    ApiResponse.created(res, investment, "Investment created successfully");
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw AppError.validationError("Validation failed", {
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const investment = await this.investmentService.updateInvestment(
      id,
      req.body
    );
    const investmentObj = investment.toObject();
    
    this.logger.audit(req, 'UPDATE_INVESTMENT', {
      resource: 'investment',
      resourceId: investmentObj.id,
      changes: Object.keys(req.body),
      metadata: { ...req.body }
    });
    
    ApiResponse.success(res, investment, "Investment updated successfully");
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const investment = await this.investmentService.deleteInvestment(id);
    const {id: investmentId, ...data} = investment.toObject();
    
    this.logger.audit(req, 'DELETE_INVESTMENT', {
      resource: 'investment',
      resourceId: investmentId,
      metadata: {
        ...data,
      },
    });
    
    ApiResponse.success(res, null, "Investment deleted successfully");
  });
}
