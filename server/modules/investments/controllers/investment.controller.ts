import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  ApiResponse,
  AppError,
  asyncHandler,
  parsePaginationParams,
} from "../../../utils/index.js";
import { InvestmentService } from "../services/investment.service.js";

export class InvestmentController {
  private readonly investmentService: InvestmentService;

  constructor() {
    this.investmentService = new InvestmentService();
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = parsePaginationParams(req.query);
    const result = await this.investmentService.getAllInvestmentsPaginated(
      req.user,
      page,
      limit
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
      req.user!
    );
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
    ApiResponse.success(res, investment, "Investment updated successfully");
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.investmentService.deleteInvestment(id);
    ApiResponse.success(res, null, "Investment deleted successfully");
  });
}
