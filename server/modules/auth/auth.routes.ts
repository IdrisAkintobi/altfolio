import { Router } from 'express';
import { AuthController } from './controllers/auth.controller.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

const router = Router();
const authController = new AuthController();

// @route   POST /api/v1/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', RegisterDto.validate(), authController.register);

// @route   POST /api/v1/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', LoginDto.validate(), authController.login);

export default router;
