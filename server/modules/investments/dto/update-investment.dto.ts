import { body, ValidationChain } from 'express-validator';

export class UpdateInvestmentDto {
  assetName?: string;
  assetType?: 'Startup' | 'Crypto Fund' | 'Farmland' | 'Collectible' | 'Other';
  investedAmount?: number;
  investmentDate?: Date;
  currentValue?: number;
  owners?: string[];

  static validate(): ValidationChain[] {
    return [
      body('assetName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Asset name must be between 2 and 200 characters'),
      body('assetType')
        .optional()
        .isIn(['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'])
        .withMessage('Invalid asset type'),
      body('investedAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Invested amount must be a positive number'),
      body('investmentDate')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Investment date must be a valid date'),
      body('currentValue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Current value must be a positive number'),
      body('owners')
        .optional()
        .isArray()
        .withMessage('Owners must be an array'),
    ];
  }
}
