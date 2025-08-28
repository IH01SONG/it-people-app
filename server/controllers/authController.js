const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT 토큰 생성
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * 회원가입
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 필수 필드 검증
    if (!email || !password || !nickname) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해주세요.'
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 이메일입니다.'
      });
    }

    // 닉네임 중복 확인
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 닉네임입니다.'
      });
    }

    // 비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 사용자 생성
    const user = new User({
      email,
      password: hashedPassword,
      nickname
    });

    await user.save();

    // JWT 토큰 생성
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl
        }
      },
      message: '회원가입이 성공적으로 완료되었습니다.'
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      error: '회원가입에 실패했습니다.'
    });
  }
};

/**
 * 로그인
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 확인
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '존재하지 않는 이메일입니다.'
      });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 일치하지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl
        }
      },
      message: '로그인이 성공적으로 완료되었습니다.'
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그인에 실패했습니다.'
    });
  }
};

/**
 * 현재 사용자 정보 조회
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
          interestedTags: user.interestedTags,
          preferredCategories: user.preferredCategories,
          notificationSettings: user.notificationSettings
        }
      }
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보를 불러오는데 실패했습니다.'
    });
  }
};

module.exports = {
  signup,
  login,
  getMe
};