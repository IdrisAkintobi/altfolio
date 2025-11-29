import Investment, { IInvestment } from "../../../db/models/Investment.js";

export interface InvestmentData {
  assetName: string;
  assetType: "Startup" | "Crypto Fund" | "Farmland" | "Collectible" | "Other";
  investedAmount: number;
  investmentDate: Date;
  currentValue: number;
  owners?: string[];
}

export interface PaginatedInvestments {
  investments: IInvestment[];
  total: number;
}

export class InvestmentRepository {
  async findAllPaginated(
    page: number,
    limit: number
  ): Promise<PaginatedInvestments> {
    const skip = (page - 1) * limit;
    const [investments, total] = await Promise.all([
      Investment.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Investment.countDocuments(),
    ]);

    return { investments, total };
  }

  async findByOwnerPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedInvestments> {
    const skip = (page - 1) * limit;
    const query = { owners: userId };
    const [investments, total] = await Promise.all([
      Investment.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Investment.countDocuments(query),
    ]);

    return { investments, total };
  }

  async findAll(): Promise<IInvestment[]> {
    return await Investment.find();
  }

  async findById(id: string): Promise<IInvestment | null> {
    return await Investment.findById(id);
  }

  async findByOwner(userId: string): Promise<IInvestment[]> {
    return await Investment.find({ owners: userId });
  }

  async create(data: InvestmentData): Promise<IInvestment> {
    const investment = new Investment(data as any);
    return await investment.save();
  }

  async update(
    id: string,
    data: Partial<InvestmentData>
  ): Promise<IInvestment | null> {
    return await Investment.findByIdAndUpdate(id, data as any, { new: true });
  }

  async delete(id: string): Promise<IInvestment | null> {
    const investment = await Investment.findById(id);
    if (!investment) {
      return null;
    }
    await investment.deleteOne();
    return investment;
  }
}
