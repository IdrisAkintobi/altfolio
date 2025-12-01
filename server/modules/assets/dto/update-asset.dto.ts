import { body, ValidationChain } from 'express-validator';
import { AssetType } from '@shared/types';

export class UpdateAssetDto {
  static validate(): ValidationChain[] {
    return [
      body('assetName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Asset name cannot be empty')
        .isLength({ min: 2, max: 100 })
        .withMessage('Asset name must be between 2 and 100 characters'),

      body('assetType').optional().isIn(Object.values(AssetType)).withMessage('Invalid asset type'),

      body('currentPerformance')
        .optional()
        .isFloat()
        .withMessage('Current performance must be a number')
        .toFloat(),
    ];
  }
}
