const Post = require('../models/Post');
const User = require('../models/User');

/**
 * 게시글 목록 조회
 * GET /api/posts
 */
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, category } = req.query;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const filter = { status: 'active' };
    if (location) {
      filter['location.address'] = { $regex: location, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const posts = await Post.find(filter)
      .populate('author', 'nickname profileImageUrl')
      .populate('participants', 'nickname profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);
    const hasMore = skip + posts.length < total;

    res.json({
      success: true,
      data: {
        posts,
        total,
        hasMore,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '게시글 목록을 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 주변 게시글 조회 (위치 기반)
 * GET /api/posts/nearby
 */
const getNearbyPosts = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: '위도와 경도가 필요합니다.'
      });
    }

    const posts = await Post.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .populate('author', 'nickname profileImageUrl')
    .populate('participants', 'nickname profileImageUrl')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('주변 게시글 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주변 게시글을 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 게시글 상세 조회
 * GET /api/posts/:postId
 */
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'nickname profileImageUrl')
      .populate('participants', 'nickname profileImageUrl');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      });
    }

    // 조회수 증가
    post.viewCount += 1;
    await post.save();

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '게시글을 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 게시글 작성
 * POST /api/posts
 */
const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      location,
      venue,
      category,
      tags,
      maxParticipants,
      meetingDate,
      image
    } = req.body;

    // 필수 필드 검증
    if (!title || !content || !location || !category || !maxParticipants) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      });
    }

    const post = new Post({
      title,
      content,
      author: req.user.id,
      location,
      venue,
      category,
      tags: tags || [],
      maxParticipants,
      meetingDate,
      image,
      participants: [req.user.id], // 작성자는 자동으로 참여자
      status: 'active'
    });

    await post.save();

    // 작성된 게시글을 populate해서 반환
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'nickname profileImageUrl')
      .populate('participants', 'nickname profileImageUrl');

    res.status(201).json({
      success: true,
      data: { post: populatedPost },
      message: '게시글이 성공적으로 작성되었습니다.'
    });
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    res.status(500).json({
      success: false,
      error: '게시글 작성에 실패했습니다.'
    });
  }
};

/**
 * 게시글 수정
 * PUT /api/posts/:postId
 */
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const updateData = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      });
    }

    // 작성자 권한 확인
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '게시글 수정 권한이 없습니다.'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
    .populate('author', 'nickname profileImageUrl')
    .populate('participants', 'nickname profileImageUrl');

    res.json({
      success: true,
      data: { post: updatedPost },
      message: '게시글이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '게시글 수정에 실패했습니다.'
    });
  }
};

/**
 * 게시글 삭제
 * DELETE /api/posts/:postId
 */
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      });
    }

    // 작성자 권한 확인
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '게시글 삭제 권한이 없습니다.'
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '게시글 삭제에 실패했습니다.'
    });
  }
};

/**
 * 모임 참여
 * POST /api/posts/:postId/join
 */
const joinPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      });
    }

    // 이미 참여 중인지 확인
    if (post.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '이미 참여 중인 모임입니다.'
      });
    }

    // 최대 참여자 수 확인
    if (post.participants.length >= post.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: '모임 정원이 가득찼습니다.'
      });
    }

    // 참여자 추가
    post.participants.push(userId);
    
    // 정원이 가득 찬 경우 상태 변경
    if (post.participants.length >= post.maxParticipants) {
      post.status = 'full';
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('author', 'nickname profileImageUrl')
      .populate('participants', 'nickname profileImageUrl');

    res.json({
      success: true,
      data: { post: updatedPost },
      message: '모임 참여가 완료되었습니다.'
    });
  } catch (error) {
    console.error('모임 참여 오류:', error);
    res.status(500).json({
      success: false,
      error: '모임 참여에 실패했습니다.'
    });
  }
};

/**
 * 모임 나가기
 * DELETE /api/posts/:postId/leave
 */
const leavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      });
    }

    // 작성자는 나갈 수 없음
    if (post.author.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: '모임 주최자는 나갈 수 없습니다.'
      });
    }

    // 참여 중인지 확인
    if (!post.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '참여하지 않은 모임입니다.'
      });
    }

    // 참여자에서 제거
    post.participants = post.participants.filter(
      id => id.toString() !== userId
    );

    // 정원이 가득 찼다가 자리가 생긴 경우 상태 변경
    if (post.status === 'full' && post.participants.length < post.maxParticipants) {
      post.status = 'active';
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('author', 'nickname profileImageUrl')
      .populate('participants', 'nickname profileImageUrl');

    res.json({
      success: true,
      data: { post: updatedPost },
      message: '모임에서 나가기가 완료되었습니다.'
    });
  } catch (error) {
    console.error('모임 나가기 오류:', error);
    res.status(500).json({
      success: false,
      error: '모임 나가기에 실패했습니다.'
    });
  }
};

module.exports = {
  getAllPosts,
  getNearbyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  joinPost,
  leavePost
};