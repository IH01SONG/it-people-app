const express = require('express');
const router = express.Router();
const { auth, rateLimit } = require('../middleware/authMiddleware');
const { validateSignup, validateLogin } = require('../middleware/validation');
const {
  signup,
  login,
  getMe
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/signup
 * @desc    회원가입
 * @access  Public
 * @body    email, password, nickname
 * @rateLimit 5 signups per hour per IP
 */
router.post('/signup', rateLimit(5, 60 * 60 * 1000), validateSignup, signup);

/**
 * @route   POST /api/auth/login
 * @desc    로그인
 * @access  Public
 * @body    email, password
 * @rateLimit 10 login attempts per 15 minutes per IP
 */
router.post('/login', rateLimit(10, 15 * 60 * 1000), validateLogin, login);

/**
 * @route   GET /api/auth/me
 * @desc    현재 사용자 정보 조회
 * @access  Private (인증 필요)
 */
router.get('/me', auth, getMe);

module.exports = router;