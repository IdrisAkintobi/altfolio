import { body, ValidationChain } from "express-validator";
import { AssetType } from "../../../../shared/types.js";

export class CreateAssetDto {
  static validate(): ValidationChain[] {
    return [
      body("assetName")
        .trim()
        .notEmpty()
        .withMessage("Asset name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Asset name must be between 2 and 100 characters"),

      body("assetType")
        .notEmpty()
        .withMessage("Asset type is required")
        .isIn(Object.values(AssetType))
        .withMessage("Invalid asset type"),

      body("currentPerformance")
        .optional()
        .isFloat()
        .withMessage("Current performance must be a number")
        .toFloat(),
    ];
  }
}
