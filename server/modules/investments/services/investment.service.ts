import { type User } from "../../../../shared/types.js";
import Asset from "../../../db/models/Asset.js";
import { IInvestment } from "../../../db/models/Investment.js";
import { AppError, PaginatedResponse } from "../../../utils/index.js";
import { createPaginationMeta } from "../../../utils/pagination.js";
import { InvestmentRepository } from "../../../db/repositories/investment.repository.js";

export interface CreateInvestmentData {
  assetId: string;
  investedAmount: number;
  investmentDate: Date;
}

export interface UpdateInvestmentData {
  assetId?: string;
  investedAmount?: number;
  investmentDate?: Date;
}

export interface InvestmentWithCalculatedValue {
  id: string;
  userId: string;
  assetId: string;
  investedAmount: number;
  investmentDate: Date;
  assetPerformanceAtInvestment: number;
  currentValue: number;
  asset: any;
}

export class InvestmentService {
  private readonly investmentRepository: InvestmentRepository;

  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  /**
   * Calculate current value of an investment based on asset performance
   */
  private calculateCurrentValue(
    investedAmount: number,
    assetPerformanceAtInvestment: number,
    currentAssetPerformance: number
  ): number {
    const performanceChange =
      currentAssetPerformance - assetPerformanceAtInvestment;
    return investedAmount * (1 + performanceChange / 100);
  }

  /**
   * Enrich investments with calculated current values
   */
  private enrichInvestmentsWithCurrentValue(
    investments: IInvestment[]
  ): InvestmentWithCalculatedValue[] {
    return investments.map((inv) => {
      const asset = inv.assetId as any;
      const currentValue = this.calculateCurrentValue(
        inv.investedAmount,
        inv.assetPerformanceAtInvestment,
        asset.currentPerformance || 0
      );

      return {
        id: inv._id.toString(),
        userId: inv.userId.toString(),
        assetId:
          typeof inv.assetId === "string"
            ? inv.assetId
            : inv.assetId._id.toString(),
        investedAmount: inv.investedAmount,
        investmentDate: inv.investmentDate,
        assetPerformanceAtInvestment: inv.assetPerformanceAtInvestment,
        currentValue,
        asset,
      };
    });
  }

  async getAllInvestmentsPaginated(
    user: User,
    page: number,
    limit: number,
    filters?: { assetId?: string; userId?: string }
  ): Promise<PaginatedResponse<InvestmentWithCalculatedValue>> {
    // Admins can see all investments, regular users see only their own
    const result =
      user.role === "admin"
        ? await this.investmentRepository.findAllInvestments(page, limit, filters)
        : await this.investmentRepository.findByUserPaginated(
            user.id,
            page,
            limit,
            filters ? { assetId: filters.assetId } : undefined
          );

    const pagination = createPaginationMeta(page, limit, result.total);
    const enrichedInvestments = this.enrichInvestmentsWithCurrentValue(
      result.investments
    );

    return {
      items: enrichedInvestments,
      pagination,
    };
  }

  async getAllInvestments(
    user: User
  ): Promise<InvestmentWithCalculatedValue[]> {
    // Admins can see all investments, regular users see only their own
    const investments =
      user.role === "admin"
        ? await this.investmentRepository.findAll()
        : await this.investmentRepository.findByUser(user.id);

    return this.enrichInvestmentsWithCurrentValue(investments);
  }

  async getInvestmentById(
    id: string,
    user: User
  ): Promise<InvestmentWithCalculatedValue> {
    const investment = await this.investmentRepository.findById(id);
    if (!investment) {
      throw AppError.notFound("Investment not found", { investmentId: id });
    }

    // Check if user has access to this investment
    if (user.role !== "admin" && investment.userId.toString() !== user.id) {
      throw AppError.forbidden("You do not have access to this investment");
    }

    return this.enrichInvestmentsWithCurrentValue([investment])[0];
  }

  async createInvestment(data: CreateInvestmentData, user: User): Promise<IInvestment> {
    // Fetch the asset to get current performance
    const asset = await Asset.findById(data.assetId);
    if (!asset) {
      throw AppError.notFound("Asset not found", { assetId: data.assetId });
    }

    // Check if asset is listed
    if (!asset.isListed) {
      throw AppError.badRequest("This asset is not available for investment");
    }

    // Check if user already has an investment in this asset
    const existingInvestment = await this.investmentRepository.findByUserAndAsset(
      user.id,
      data.assetId
    );

    if (existingInvestment) {
      // "Restake" - add to existing investment and reset the performance baseline
      // This is like withdrawing everything and investing the total at current performance
      const newTotalAmount = existingInvestment.investedAmount + data.investedAmount;
      
      const updated = await this.investmentRepository.update(existingInvestment._id.toString(), {
        investedAmount: newTotalAmount,
        investmentDate: data.investmentDate, // Update to latest investment date
        assetPerformanceAtInvestment: asset.currentPerformance, // Reset to current performance
      });
      
      if (!updated) {
        throw AppError.internalServerError("Failed to update investment");
      }
      
      return updated;
    }


    // Create new investment with asset performance at time of investment
    return await this.investmentRepository.createInvestment({
      userId: user.id,
      assetId: data.assetId,
      investedAmount: data.investedAmount,
      investmentDate: data.investmentDate,
      assetPerformanceAtInvestment: asset.currentPerformance,
    });
  }

  async updateInvestment(
    id: string,
    data: UpdateInvestmentData
  ): Promise<IInvestment> {
    const investment = await this.investmentRepository.update(id, data);
    if (!investment) {
      throw AppError.notFound("Investment not found", { investmentId: id });
    }
    return investment;
  }

  async deleteInvestment(id: string): Promise<void> {
    const investment = await this.investmentRepository.deleteInvestment(id);
    if (!investment) {
      throw AppError.notFound("Investment not found", { investmentId: id });
    }
  }
}
