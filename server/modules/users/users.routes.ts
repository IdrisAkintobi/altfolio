import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/authorize.middleware.js';
import { UserController } from './controllers/user.controller.js';

const router = Router();
const userController = new UserController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// @route   GET /api/v1/users
// @desc    Get all users
// @access  Admin only
router.get('/', userController.getAll);

// @route   GET /api/v1/users/:id
// @desc    Get user by ID
// @access  Admin only
router.get('/:id', userController.getById);

export default router;
