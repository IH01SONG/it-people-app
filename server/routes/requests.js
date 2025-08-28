const express = require('express');
const router = express.Router();
const { auth, requireOwnership, rateLimit } = require('../middleware/authMiddleware');
const JoinRequest = require('../models/JoinRequest');
const {
  createJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  getMyRequests,
  getReceivedRequests
} = require('../controllers/requestsController');

// 요청 소유권 확인 헬퍼 함수들
const getRequestPostOwnerId = async (req) => {
  const request = await JoinRequest.findById(req.params.requestId).select('postAuthor');
  return request?.postAuthor;
};

/**
 * @route   POST /api/join-requests/posts/:postId/request-join
 * @desc    참여 요청 보내기
 * @access  Private (인증 필요)
 * @rateLimit 20 requests per hour
 */
router.post('/posts/:postId/request-join', auth, rateLimit(20, 60 * 60 * 1000), createJoinRequest);

/**
 * @route   POST /api/join-requests/:requestId/accept
 * @desc    참여 요청 수락
 * @access  Private (게시글 작성자만)
 */
router.post(
  '/:requestId/accept', 
  auth, 
  requireOwnership(getRequestPostOwnerId), 
  acceptJoinRequest
);

/**
 * @route   POST /api/join-requests/:requestId/reject
 * @desc    참여 요청 거절
 * @access  Private (게시글 작성자만)
 */
router.post(
  '/:requestId/reject', 
  auth, 
  requireOwnership(getRequestPostOwnerId), 
  rejectJoinRequest
);

/**
 * @route   GET /api/join-requests/my-requests
 * @desc    내가 보낸 참여 요청 목록
 * @access  Private (인증 필요)
 */
router.get('/my-requests', auth, getMyRequests);

/**
 * @route   GET /api/join-requests/received
 * @desc    내 게시글에 온 참여 요청 목록
 * @access  Private (인증 필요)
 */
router.get('/received', auth, getReceivedRequests);

module.exports = router;