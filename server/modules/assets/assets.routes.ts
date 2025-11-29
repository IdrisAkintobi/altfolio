import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/authorize.middleware.js";
import { AssetController } from "./controllers/asset.controller.js";
import { CreateAssetDto } from "./dto/create-asset.dto.js";
import { UpdateAssetDto } from "./dto/update-asset.dto.js";
import { UpdatePerformanceDto } from "./dto/update-performance.dto.js";

const router = Router();
const assetController = new AssetController();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/v1/assets
// @desc    Get all assets (paginated)
// @access  Private
router.get("/", assetController.getAll);

// @route   GET /api/v1/assets/type/:type
// @desc    Get assets by type
// @access  Private
router.get("/type/:type", assetController.getByType);

// @route   GET /api/v1/assets/:id
// @desc    Get asset by ID
// @access  Private
router.get("/:id", assetController.getById);

// @route   GET /api/v1/assets/:id/performance-history
// @desc    Get asset performance history with optional date range
// @query   startDate, endDate, limit
// @access  Private
router.get("/:id/performance-history", assetController.getPerformanceHistory);

// @route   POST /api/v1/assets
// @desc    Create a new asset
// @access  Admin only
router.post("/", requireAdmin, CreateAssetDto.validate(), assetController.create);

// @route   PUT /api/v1/assets/:id
// @desc    Update asset details
// @access  Admin only
router.put("/:id", requireAdmin, UpdateAssetDto.validate(), assetController.update);

// @route   PATCH /api/v1/assets/:id/performance
// @desc    Update asset performance (creates history entry)
// @access  Admin only
router.patch(
  "/:id/performance",
  requireAdmin,
  UpdatePerformanceDto.validate(),
  assetController.updatePerformance
);

// @route   DELETE /api/v1/assets/:id
// @desc    Delete asset
// @access  Admin only
router.delete("/:id", requireAdmin, assetController.delete);

export default router;
