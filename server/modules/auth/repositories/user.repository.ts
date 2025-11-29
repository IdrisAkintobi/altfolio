import { UserRole } from "../../../../shared/types.js";
import User, { IUser } from "../../../db/models/User.js";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async create(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<IUser> {
    return await User.create(userData);
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }

  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }

  async findAll(): Promise<IUser[]> {
    return await User.find();
  }
}
