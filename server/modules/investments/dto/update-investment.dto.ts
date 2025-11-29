import { body, ValidationChain } from 'express-validator';

export class UpdateInvestmentDto {
  assetId?: string;
  investedAmount?: number;
  investmentDate?: Date;

  static validate(): ValidationChain[] {
    return [
      body('assetId')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('Asset ID must be a valid MongoDB ObjectId'),
      body('investedAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Invested amount must be a positive number')
        .toFloat(),
      body('investmentDate')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Investment date must be a valid date'),
    ];
  }
}
