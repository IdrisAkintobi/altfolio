import mongoose, { Document, Model, UpdateQuery } from "mongoose";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: any): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async findAll(filter: any = {}): Promise<T[]> {
    return await this.model.find(filter);
  }

  async findAllPaginated(
    filter: any,
    page: number,
    limit: number,
    sort: any = { createdAt: -1 }
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort(sort),
      this.model.countDocuments(filter),
    ]);

    return { items, total };
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async exists(filter: any): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  async count(filter: any = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async withTransaction<R>(
    callback: (session: mongoose.ClientSession) => Promise<R>
  ): Promise<R> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
