import argon2 from "argon2";
import { type User } from "../../../../shared/types.js";
import { AppError } from "../../../utils/index.js";
import { generateToken } from "../../../utils/jwt.js";
import { UserRepository } from "../../../db/repositories/user.repository.js";

export interface RegisterData {
  name?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: "admin" | "viewer";
  token: string;
}

export class AuthService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw AppError.conflict("User already exists", {
        field: "email",
        value: data.email,
      });
    }

    // Hash password with Argon2
    const passwordHash = await argon2.hash(data.password);

    // Create user
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    return await this.generateAuthResponse(user.toObject());
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    // Verify password with Argon2
    const isValidPassword = await argon2.verify(
      user.passwordHash,
      data.password
    );
    if (!isValidPassword) {
      throw AppError.unauthorized("Invalid email or password");
    }

    return await this.generateAuthResponse(user.toObject());
  }

  private async generateAuthResponse(user: User): Promise<AuthResponse> {
    const token = await generateToken(user.id);

    return {
      ...user,
      token,
    };
  }
}
