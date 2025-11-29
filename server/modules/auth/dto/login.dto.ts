import { body, ValidationChain } from 'express-validator';

export class LoginDto {
  email!: string;
  password!: string;

  static validate(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
      body('password')
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }
}
