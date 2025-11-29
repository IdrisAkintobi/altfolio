import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/authorize.middleware.js';
import { InvestmentController } from './controllers/investment.controller.js';
import { CreateInvestmentDto } from './dto/create-investment.dto.js';
import { UpdateInvestmentDto } from './dto/update-investment.dto.js';

const router = Router();
const investmentController = new InvestmentController();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/v1/investments
// @desc    Get all investments (users see only their investments, admins see all)
// @access  Private
router.get('/', investmentController.getAll);

// @route   GET /api/v1/investments/:id
// @desc    Get investment by ID (must be owner or admin)
// @access  Private
router.get('/:id', investmentController.getById);

// @route   POST /api/v1/investments
// @desc    Create an investment
// @access  Admin only
router.post('/', requireAdmin, CreateInvestmentDto.validate(), investmentController.create);

// @route   PUT /api/v1/investments/:id
// @desc    Update investment
// @access  Admin only
router.put('/:id', requireAdmin, UpdateInvestmentDto.validate(), investmentController.update);

// @route   DELETE /api/v1/investments/:id
// @desc    Delete investment
// @access  Admin only
router.delete('/:id', requireAdmin, investmentController.delete);

export default router;
