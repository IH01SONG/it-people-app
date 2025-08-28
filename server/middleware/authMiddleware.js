const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT 토큰 검증 및 사용자 인증 미들웨어
 * 
 * 사용법:
 * - 필수 인증: auth
 * - 선택적 인증: optionalAuth
 * - 역할 기반 인증: requireRole(['admin', 'moderator'])
 */

/**
 * 기본 JWT 인증 미들웨어
 * Authorization: Bearer <token> 형태의 헤더에서 토큰을 추출하고 검증
 */
const auth = async (req, res, next) => {
  try {
    // 1. 토큰 추출
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '접근이 거부되었습니다. 인증 토큰이 필요합니다.',
        code: 'TOKEN_MISSING'
      });
    }

    // 2. 토큰 검증
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (tokenError) {
      let errorMessage = '유효하지 않은 토큰입니다.';
      let errorCode = 'TOKEN_INVALID';

      if (tokenError.name === 'TokenExpiredError') {
        errorMessage = '만료된 토큰입니다. 다시 로그인해주세요.';
        errorCode = 'TOKEN_EXPIRED';
      } else if (tokenError.name === 'JsonWebTokenError') {
        errorMessage = '잘못된 형식의 토큰입니다.';
        errorCode = 'TOKEN_MALFORMED';
      }

      return res.status(401).json({
        success: false,
        error: errorMessage,
        code: errorCode
      });
    }

    // 3. 사용자 정보 조회 및 검증
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean(); // 성능 최적화를 위해 lean() 사용

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다. 다시 로그인해주세요.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 4. 계정 상태 확인 (비활성화, 차단 등)
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        error: '차단된 계정입니다.',
        code: 'ACCOUNT_BANNED'
      });
    }

    // 5. req.user에 사용자 정보 저장
    req.user = {
      id: user._id.toString(),
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      role: user.role || 'user',
      status: user.status || 'active',
      createdAt: user.createdAt,
      // 토큰 정보도 포함 (필요한 경우)
      tokenIssuedAt: new Date(decoded.iat * 1000),
      tokenExpiresAt: new Date(decoded.exp * 1000)
    };

    // 6. 다음 미들웨어로 진행
    next();

  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    res.status(500).json({
      success: false,
      error: '인증 처리 중 서버 오류가 발생했습니다.',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하지만, 없어도 통과시킴
 * 공개 API에서 로그인 사용자에게 추가 정보를 제공할 때 사용
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // 토큰이 없으면 그냥 통과
    if (!token) {
      req.user = null;
      return next();
    }

    // 토큰이 있으면 검증 시도
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId)
        .select('-password')
        .lean();

      if (user && user.status !== 'banned' && user.status !== 'inactive') {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
          role: user.role || 'user',
          status: user.status || 'active'
        };
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      // 토큰 오류가 있어도 그냥 통과 (선택적이므로)
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('선택적 인증 미들웨어 오류:', error);
    req.user = null;
    next();
  }
};

/**
 * 역할 기반 접근 제어 미들웨어
 * 특정 역할을 가진 사용자만 접근 허용
 * 
 * @param {string|string[]} roles - 허용할 역할들
 * @returns {Function} 미들웨어 함수
 * 
 * 사용 예:
 * router.delete('/admin/users/:id', auth, requireRole('admin'), deleteUser);
 * router.post('/moderate/posts/:id', auth, requireRole(['admin', 'moderator']), moderatePost);
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    // auth 미들웨어가 먼저 실행되어야 함
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: '접근 권한이 없습니다.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * 리소스 소유권 확인 미들웨어
 * 사용자가 해당 리소스의 소유자인지 확인
 * 
 * @param {Function} getResourceOwnerId - 리소스 소유자 ID를 가져오는 함수
 * @returns {Function} 미들웨어 함수
 */
const requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.',
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      const resourceOwnerId = await getResourceOwnerId(req);
      
      if (!resourceOwnerId) {
        return res.status(404).json({
          success: false,
          error: '리소스를 찾을 수 없습니다.',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // 관리자는 모든 리소스에 접근 가능
      if (req.user.role === 'admin') {
        return next();
      }

      // 소유자 확인
      if (resourceOwnerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '해당 리소스에 대한 권한이 없습니다.',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('소유권 확인 오류:', error);
      res.status(500).json({
        success: false,
        error: '권한 확인 중 오류가 발생했습니다.',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

/**
 * API 사용량 제한 미들웨어 (간단한 구현)
 * Redis를 사용한 고급 구현으로 교체 가능
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? req.user.id : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // 이전 요청 기록 정리
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requireOwnership,
  rateLimit
};