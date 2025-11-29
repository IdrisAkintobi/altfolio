import { body, ValidationChain } from "express-validator";

export class RegisterDto {
  name?: string;
  email!: string;
  password!: string;

  static validate(): ValidationChain[] {
    return [
      body("email")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
      body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters"),
    ];
  }
}
