import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiResponse, AppError, asyncHandler } from "../../../utils/index.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err: any) => ({
          path: err.path,
          msg: err.msg,
        }));
        throw AppError.validationError("Validation failed", {
          errors: formattedErrors,
        });
      }

      const { name, email, password } = req.body;
      const result = await this.authService.register({ name, email, password });

      ApiResponse.created(res, result, "User registered successfully");
    }
  );

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err: any) => ({
        path: err.path,
        msg: err.msg,
      }));
      throw AppError.validationError("Validation failed", {
        errors: formattedErrors,
      });
    }

    const { email, password } = req.body;
    const result = await this.authService.login({ email, password });

    ApiResponse.success(res, result, "Login successful");
  });
}
