import Investment, { IInvestment } from "../models/Investment.js";
import { BaseRepository } from "./base.repository.js";

export interface InvestmentData {
  userId: string;
  assetId: string;
  investedAmount: number;
  investmentDate: Date;
  assetPerformanceAtInvestment: number;
  status?: string;
}

export interface PaginatedInvestments {
  investments: IInvestment[];
  total: number;
}

export interface InvestmentWithAsset extends IInvestment {
  asset?: any;
}

export class InvestmentRepository extends BaseRepository<IInvestment> {
  constructor() {
    super(Investment);
  }

  async findAllInvestments(
    page: number,
    limit: number
  ): Promise<PaginatedInvestments> {
    const skip = (page - 1) * limit;
    const [investments, total] = await Promise.all([
      Investment.find()
        .populate("assetId")
        .skip(skip)
        .limit(limit)
        .sort({ investmentDate: -1 }),
      Investment.countDocuments(),
    ]);

    return { investments, total };
  }

  async findByUserPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedInvestments> {
    const skip = (page - 1) * limit;
    const query = { userId };
    const [investments, total] = await Promise.all([
      Investment.find(query)
        .populate("assetId")
        .skip(skip)
        .limit(limit)
        .sort({ investmentDate: -1 }),
      Investment.countDocuments(query),
    ]);

    return { investments, total };
  }

  async findByIdWithAsset(id: string): Promise<IInvestment | null> {
    return await Investment.findById(id).populate("assetId");
  }

  async findByUser(userId: string): Promise<IInvestment[]> {
    return await Investment.find({ userId })
      .populate("assetId")
      .sort({ investmentDate: -1 });
  }

  async findByAsset(assetId: string): Promise<IInvestment[]> {
    return await Investment.find({ assetId })
      .populate("userId")
      .sort({ investmentDate: -1 });
  }

  async findByUserAndAsset(
    userId: string,
    assetId: string
  ): Promise<IInvestment | null> {
    return await Investment.findOne({ userId, assetId }).populate("assetId");
  }

  async createInvestment(data: InvestmentData): Promise<IInvestment> {
    const investment = new Investment(data);
    const saved = await investment.save();
    return (await saved.populate("assetId")) as IInvestment;
  }

  async updateInvestment(
    id: string,
    data: Partial<InvestmentData>
  ): Promise<IInvestment | null> {
    return await Investment.findByIdAndUpdate(id, data, { new: true }).populate(
      "assetId"
    );
  }

  async deleteInvestment(id: string): Promise<IInvestment | null> {
    const investment = await Investment.findById(id);
    if (!investment) {
      return null;
    }
    await investment.deleteOne();
    return investment;
  }
}
