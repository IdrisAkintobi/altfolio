import { Request, Response } from "express";
import { ApiResponse, asyncHandler, parsePaginationParams } from "../../../utils/index.js";
import { UserService } from "../services/user.service.js";

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = parsePaginationParams(req.query);
    const search = req.query.search as string | undefined;
    const result = await this.userService.getAllUsersPaginated(page, limit, search);
    ApiResponse.paginated(res, result, "Users retrieved successfully");
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    ApiResponse.success(res, user, "User retrieved successfully");
  });
}
