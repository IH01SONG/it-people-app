const { body, param, query, validationResult } = require('express-validator');

/**
 * 검증 결과 확인 미들웨어
 * express-validator의 검증 결과를 확인하고 에러가 있으면 응답 반환
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: '입력 값이 올바르지 않습니다.',
      code: 'VALIDATION_ERROR',
      details: errorMessages
    });
  }

  next();
};

/**
 * 회원가입 검증 규칙
 */
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('올바른 이메일 주소를 입력해주세요.')
    .isLength({ min: 5, max: 100 })
    .withMessage('이메일은 5-100자 사이여야 합니다.'),
  
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('비밀번호는 6-50자 사이여야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*\d)/)
    .withMessage('비밀번호는 최소 하나의 소문자와 숫자를 포함해야 합니다.'),
  
  body('nickname')
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2-20자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9가-힣_-]+$/)
    .withMessage('닉네임은 한글, 영문, 숫자, _, - 만 사용 가능합니다.')
    .trim(),

  handleValidationErrors
];

/**
 * 로그인 검증 규칙
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('올바른 이메일 주소를 입력해주세요.'),
  
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),

  handleValidationErrors
];

/**
 * 게시글 작성 검증 규칙
 */
const validateCreatePost = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('제목은 5-100자 사이여야 합니다.')
    .trim(),
  
  body('content')
    .isLength({ min: 10, max: 2000 })
    .withMessage('내용은 10-2000자 사이여야 합니다.')
    .trim(),
  
  body('category')
    .isIn(['식사', '카페', '쇼핑', '운동', '스터디', '문화생활', '기타'])
    .withMessage('올바른 카테고리를 선택해주세요.'),
  
  body('maxParticipants')
    .isInt({ min: 2, max: 50 })
    .withMessage('최대 참여자는 2-50명 사이여야 합니다.'),
  
  body('location.type')
    .equals('Point')
    .withMessage('위치 타입은 Point여야 합니다.'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('좌표는 [경도, 위도] 형태의 배열이어야 합니다.'),
  
  body('location.coordinates.*')
    .isFloat({ min: -180, max: 180 })
    .withMessage('좌표는 유효한 숫자여야 합니다.'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('각 태그는 1-20자 사이여야 합니다.')
    .trim(),
  
  body('venue')
    .optional()
    .isLength({ max: 100 })
    .withMessage('장소명은 100자를 초과할 수 없습니다.')
    .trim(),
  
  body('meetingDate')
    .optional()
    .isISO8601()
    .withMessage('올바른 날짜 형식을 입력해주세요.')
    .custom((value) => {
      const meetingDate = new Date(value);
      const now = new Date();
      if (meetingDate <= now) {
        throw new Error('모임 날짜는 현재 시간 이후여야 합니다.');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * 게시글 수정 검증 규칙
 */
const validateUpdatePost = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('제목은 5-100자 사이여야 합니다.')
    .trim(),
  
  body('content')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('내용은 10-2000자 사이여야 합니다.')
    .trim(),
  
  body('category')
    .optional()
    .isIn(['식사', '카페', '쇼핑', '운동', '스터디', '문화생활', '기타'])
    .withMessage('올바른 카테고리를 선택해주세요.'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('최대 참여자는 2-50명 사이여야 합니다.'),

  handleValidationErrors
];

/**
 * 프로필 수정 검증 규칙
 */
const validateUpdateProfile = [
  body('nickname')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2-20자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9가-힣_-]+$/)
    .withMessage('닉네임은 한글, 영문, 숫자, _, - 만 사용 가능합니다.')
    .trim(),
  
  body('profileImageUrl')
    .optional()
    .isURL()
    .withMessage('올바른 URL 형식을 입력해주세요.'),
  
  body('interestedTags')
    .optional()
    .isArray()
    .withMessage('관심 태그는 배열 형태여야 합니다.'),
  
  body('interestedTags.*')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('각 태그는 1-20자 사이여야 합니다.')
    .trim(),
  
  body('preferredCategories')
    .optional()
    .isArray()
    .withMessage('선호 카테고리는 배열 형태여야 합니다.'),
  
  body('preferredCategories.*')
    .optional()
    .isIn(['식사', '카페', '쇼핑', '운동', '스터디', '문화생활', '기타'])
    .withMessage('올바른 카테고리를 선택해주세요.'),

  handleValidationErrors
];

/**
 * ObjectId 검증 규칙
 */
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`올바른 ${paramName} ID 형식이 아닙니다.`),
  
  handleValidationErrors
];

/**
 * 페이지네이션 검증 규칙
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('페이지는 1-1000 사이의 정수여야 합니다.'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('제한값은 1-100 사이의 정수여야 합니다.'),

  handleValidationErrors
];

/**
 * 위치 기반 검색 검증 규칙
 */
const validateLocationSearch = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('위도는 -90에서 90 사이의 값이어야 합니다.'),
  
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('경도는 -180에서 180 사이의 값이어야 합니다.'),
  
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('반경은 100m에서 50km 사이여야 합니다.'),

  handleValidationErrors
];

/**
 * 알림 설정 검증 규칙
 */
const validateNotificationSettings = [
  body('notificationSettings.joinRequests')
    .optional()
    .isBoolean()
    .withMessage('참여 요청 알림 설정은 boolean 값이어야 합니다.'),
  
  body('notificationSettings.requestAccepted')
    .optional()
    .isBoolean()
    .withMessage('요청 수락 알림 설정은 boolean 값이어야 합니다.'),
  
  body('notificationSettings.requestRejected')
    .optional()
    .isBoolean()
    .withMessage('요청 거절 알림 설정은 boolean 값이어야 합니다.'),
  
  body('notificationSettings.postFull')
    .optional()
    .isBoolean()
    .withMessage('모임 마감 알림 설정은 boolean 값이어야 합니다.'),
  
  body('notificationSettings.postReminder')
    .optional()
    .isBoolean()
    .withMessage('모임 리마인더 알림 설정은 boolean 값이어야 합니다.'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateCreatePost,
  validateUpdatePost,
  validateUpdateProfile,
  validateObjectId,
  validatePagination,
  validateLocationSearch,
  validateNotificationSettings
};