import { body, ValidationChain } from "express-validator";

export class UpdatePerformanceDto {
  static validate(): ValidationChain[] {
    return [
      body("percentageChange")
        .notEmpty()
        .withMessage("Percentage change is required")
        .isFloat()
        .withMessage("Percentage change must be a number")
        .toFloat(),
    ];
  }
}
