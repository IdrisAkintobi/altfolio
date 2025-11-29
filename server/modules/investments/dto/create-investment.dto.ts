import { body, ValidationChain } from 'express-validator';

export class CreateInvestmentDto {
  assetName!: string;
  assetType!: 'Startup' | 'Crypto Fund' | 'Farmland' | 'Collectible' | 'Other';
  investedAmount!: number;
  investmentDate!: Date;
  currentValue!: number;
  owners!: string[];

  static validate(): ValidationChain[] {
    return [
      body('assetName')
        .trim()
        .notEmpty()
        .withMessage('Asset name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Asset name must be between 2 and 200 characters'),
      body('assetType')
        .isIn(['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'])
        .withMessage('Invalid asset type'),
      body('investedAmount')
        .isFloat({ min: 0 })
        .withMessage('Invested amount must be a positive number'),
      body('investmentDate')
        .isISO8601()
        .toDate()
        .withMessage('Investment date must be a valid date'),
      body('currentValue')
        .isFloat({ min: 0 })
        .withMessage('Current value must be a positive number'),
      body('owners')
        .optional()
        .isArray()
        .withMessage('Owners must be an array')
        .custom((value) => {
          if (value && !value.every((item: any) => typeof item === 'string')) {
            throw new Error('All owners must be strings');
          }
          return true;
        }),
    ];
  }
}
