const express = require('express');
const router = express.Router();
const { auth, requireRole, rateLimit } = require('../middleware/authMiddleware');
const {
  getMyProfile,
  updateMyProfile,
  getMyPosts,
  getJoinedPosts,
  blockUser,
  unblockUser,
  updateNotificationSettings
} = require('../controllers/usersController');

/**
 * @route   GET /api/users/me
 * @desc    내 정보 조회
 * @access  Private (인증 필요)
 */
router.get('/me', auth, getMyProfile);

/**
 * @route   PUT /api/users/me
 * @desc    프로필 수정
 * @access  Private (인증 필요)
 * @body    nickname, profileImageUrl, interestedTags, preferredCategories
 * @rateLimit 10 updates per hour
 */
router.put('/me', auth, rateLimit(10, 60 * 60 * 1000), updateMyProfile);

/**
 * @route   GET /api/users/me/posts
 * @desc    내가 쓴 게시글 조회
 * @access  Private (인증 필요)
 */
router.get('/me/posts', auth, getMyPosts);

/**
 * @route   GET /api/users/me/joined-posts
 * @desc    참여한 모임 조회
 * @access  Private (인증 필요)
 */
router.get('/me/joined-posts', auth, getJoinedPosts);

/**
 * @route   POST /api/users/block/:userId
 * @desc    사용자 차단
 * @access  Private (인증 필요)
 * @rateLimit 20 blocks per day
 */
router.post('/block/:userId', auth, rateLimit(20, 24 * 60 * 60 * 1000), blockUser);

/**
 * @route   DELETE /api/users/block/:userId
 * @desc    사용자 차단 해제
 * @access  Private (인증 필요)
 */
router.delete('/block/:userId', auth, unblockUser);

/**
 * @route   PUT /api/users/me/notification-settings
 * @desc    알림 설정 수정
 * @access  Private (인증 필요)
 * @body    notificationSettings
 */
router.put('/me/notification-settings', auth, updateNotificationSettings);

module.exports = router;