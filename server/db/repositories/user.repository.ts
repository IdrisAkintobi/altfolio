import { UserRole } from "../../../shared/types.js";
import User, { IUser } from "../models/User.js";
import { BaseRepository } from "./base.repository.js";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }

  async findAllUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { _id: search },
      ];
    }

    const result = await this.findAllPaginated(query, page, limit);
    return { users: result.items, total: result.total };
  }
}
