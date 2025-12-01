import { type User } from '@shared/types';
import { UserRepository } from '../../../db/repositories/user.repository.js';
import { PaginatedResponse } from '../../../utils/index.js';
import { createPaginationMeta } from '../../../utils/pagination.js';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => user.toObject());
  }

  async getAllUsersPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResponse<User>> {
    const result = await this.userRepository.findAllUsers(page, limit, search);
    const pagination = createPaginationMeta(page, limit, result.total);
    const users = result.users.map((user) => user.toObject());

    return {
      items: users,
      pagination,
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toObject();
  }
}
