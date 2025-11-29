import { body, ValidationChain } from 'express-validator';

export class CreateInvestmentDto {
  assetId!: string;
  investedAmount!: number;
  investmentDate!: Date;

  static validate(): ValidationChain[] {
    return [
      body('assetId')
        .trim()
        .notEmpty()
        .withMessage('Asset ID is required')
        .isMongoId()
        .withMessage('Asset ID must be a valid MongoDB ObjectId'),
      body('investedAmount')
        .isFloat({ min: 0 })
        .withMessage('Invested amount must be a positive number')
        .toFloat(),
      body('investmentDate')
        .isISO8601()
        .toDate()
        .withMessage('Investment date must be a valid date'),
    ];
  }
}
