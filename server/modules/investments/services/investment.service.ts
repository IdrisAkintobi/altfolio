import { UserRole } from "../../../../shared/types.js";
import { IInvestment } from "../../../db/models/Investment.js";
import { AppError, PaginatedResponse } from "../../../utils/index.js";
import { createPaginationMeta } from "../../../utils/pagination.js";
import { InvestmentRepository } from "../repositories/investment.repository.js";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface CreateInvestmentData {
  assetName: string;
  assetType: "Startup" | "Crypto Fund" | "Farmland" | "Collectible" | "Other";
  investedAmount: number;
  investmentDate: Date;
  currentValue: number;
  owners?: string[];
}

export interface UpdateInvestmentData {
  assetName?: string;
  assetType?: "Startup" | "Crypto Fund" | "Farmland" | "Collectible" | "Other";
  investedAmount?: number;
  investmentDate?: Date;
  currentValue?: number;
  owners?: string[];
}

export class InvestmentService {
  private readonly investmentRepository: InvestmentRepository;

  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async getAllInvestmentsPaginated(
    user: AuthUser,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<IInvestment>> {
    // Admins can see all investments, regular users see only their own
    const result =
      user.role === "admin"
        ? await this.investmentRepository.findAllPaginated(page, limit)
        : await this.investmentRepository.findByOwnerPaginated(
            user.id,
            page,
            limit
          );

    const pagination = createPaginationMeta(page, limit, result.total);

    return {
      items: result.investments,
      pagination,
    };
  }

  async getAllInvestments(user: AuthUser): Promise<IInvestment[]> {
    // Admins can see all investments, regular users see only their own
    if (user.role === "admin") {
      return await this.investmentRepository.findAll();
    }

    // Find investments where user is an owner
    return await this.investmentRepository.findByOwner(user.id);
  }

  async getInvestmentById(id: string, user: AuthUser): Promise<IInvestment> {
    const investment = await this.investmentRepository.findById(id);
    if (!investment) {
      throw AppError.notFound("Investment not found", { investmentId: id });
    }

    // Check if user has access to this investment
    if (
      user.role !== "admin" &&
      !investment.owners.some((owner) => owner.toString() === user.id)
    ) {
      throw AppError.forbidden("You do not have access to this investment");
    }

    return investment;
  }

  async createInvestment(data: CreateInvestmentData): Promise<IInvestment> {
    return await this.investmentRepository.create(data);
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
    const investment = await this.investmentRepository.delete(id);
    if (!investment) {
      throw AppError.notFound("Investment not found", { investmentId: id });
    }
  }
}
