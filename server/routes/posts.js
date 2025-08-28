const express = require('express');
const router = express.Router();
const { 
  auth, 
  optionalAuth, 
  requireOwnership,
  rateLimit 
} = require('../middleware/authMiddleware');
const { 
  validateCreatePost, 
  validateUpdatePost, 
  validateObjectId, 
  validatePagination, 
  validateLocationSearch 
} = require('../middleware/validation');
const Post = require('../models/Post');
const {
  getAllPosts,
  getNearbyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  joinPost,
  leavePost
} = require('../controllers/postsController');

// 게시글 소유자 확인 헬퍼 함수
const getPostOwnerId = async (req) => {
  const post = await Post.findById(req.params.postId).select('author');
  return post?.author;
};

/**
 * @route   GET /api/posts
 * @desc    게시글 목록 조회 (로그인 시 추가 정보 제공)
 * @access  Public (선택적 인증)
 * @query   page, limit, location, category
 */
router.get('/', validatePagination, optionalAuth, getAllPosts);

/**
 * @route   GET /api/posts/nearby
 * @desc    주변 게시글 조회 (위치 기반, 로그인 시 추가 정보 제공)
 * @access  Public (선택적 인증)
 * @query   lat, lng, radius
 */
router.get('/nearby', validateLocationSearch, optionalAuth, getNearbyPosts);

/**
 * @route   GET /api/posts/:postId
 * @desc    게시글 상세 조회 (로그인 시 추가 정보 제공)
 * @access  Public (선택적 인증)
 */
router.get('/:postId', validateObjectId('postId'), optionalAuth, getPostById);

/**
 * @route   POST /api/posts
 * @desc    게시글 작성
 * @access  Private (인증 필요)
 * @body    title, content, location, venue, category, tags, maxParticipants, meetingDate, image
 * @rateLimit 5 posts per hour
 */
router.post('/', auth, rateLimit(5, 60 * 60 * 1000), validateCreatePost, createPost);

/**
 * @route   PUT /api/posts/:postId
 * @desc    게시글 수정
 * @access  Private (작성자 또는 관리자만)
 * @body    수정할 필드들
 */
router.put(
  '/:postId', 
  validateObjectId('postId'),
  auth, 
  requireOwnership(getPostOwnerId),
  validateUpdatePost,
  updatePost
);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    게시글 삭제
 * @access  Private (작성자 또는 관리자만)
 */
router.delete(
  '/:postId', 
  validateObjectId('postId'),
  auth, 
  requireOwnership(getPostOwnerId), 
  deletePost
);

/**
 * @route   POST /api/posts/:postId/join
 * @desc    모임 참여
 * @access  Private (인증 필요)
 * @rateLimit 10 join requests per minute
 */
router.post('/:postId/join', validateObjectId('postId'), auth, rateLimit(10, 60 * 1000), joinPost);

/**
 * @route   DELETE /api/posts/:postId/leave
 * @desc    모임 나가기
 * @access  Private (인증 필요)
 */
router.delete('/:postId/leave', validateObjectId('postId'), auth, leavePost);

module.exports = router;