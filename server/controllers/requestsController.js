const JoinRequest = require('../models/JoinRequest');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

/**
 * 참여 요청 보내기
 * POST /api/join-requests/posts/:postId/request-join
 */
const createJoinRequest = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // 게시글 존재 확인
    const post = await Post.findById(postId).populate('author');
    if (!post) {
      return res.status(404).json({
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      });
    }

    // 자신의 게시글에는 참여 요청 불가
    if (post.author._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: '자신의 게시글에는 참여 요청을 할 수 없습니다.'
      });
    }

    // 이미 참여 중인지 확인
    if (post.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '이미 참여 중인 모임입니다.'
      });
    }

    // 이미 요청을 보냈는지 확인
    const existingRequest = await JoinRequest.findOne({
      post: postId,
      requester: userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: '이미 참여 요청을 보냈습니다.'
      });
    }

    // 모임이 가득 찬 경우
    if (post.participants.length >= post.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: '모임 정원이 가득찼습니다.'
      });
    }

    // 참여 요청 생성
    const joinRequest = new JoinRequest({
      post: postId,
      requester: userId,
      postAuthor: post.author._id
    });

    await joinRequest.save();

    // 게시글 작성자에게 알림 생성
    const notification = new Notification({
      userId: post.author._id,
      type: 'join_request',
      title: '새로운 모임 참여 요청',
      message: `"${post.title}" 모임에 참여 요청이 왔습니다.`,
      data: {
        postId: postId,
        requestId: joinRequest._id
      }
    });

    await notification.save();

    const populatedRequest = await JoinRequest.findById(joinRequest._id)
      .populate('requester', 'nickname profileImageUrl')
      .populate('post', 'title');

    res.status(201).json({
      success: true,
      data: { request: populatedRequest },
      message: '참여 요청이 성공적으로 전송되었습니다.'
    });
  } catch (error) {
    console.error('참여 요청 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '참여 요청 전송에 실패했습니다.'
    });
  }
};

/**
 * 참여 요청 수락
 * POST /api/join-requests/:requestId/accept
 */
const acceptJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const joinRequest = await JoinRequest.findById(requestId)
      .populate('post')
      .populate('requester', 'nickname profileImageUrl');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        error: '참여 요청을 찾을 수 없습니다.'
      });
    }

    // 게시글 작성자만 수락 가능
    if (joinRequest.postAuthor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '요청 수락 권한이 없습니다.'
      });
    }

    // 이미 처리된 요청인지 확인
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: '이미 처리된 요청입니다.'
      });
    }

    const post = joinRequest.post;

    // 모임이 가득 찬 경우
    if (post.participants.length >= post.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: '모임 정원이 가득찼습니다.'
      });
    }

    // 참여자 추가
    post.participants.push(joinRequest.requester._id);
    
    // 정원이 가득 찬 경우 상태 변경
    if (post.participants.length >= post.maxParticipants) {
      post.status = 'full';
    }

    await post.save();

    // 요청 상태 변경
    joinRequest.status = 'accepted';
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    // 요청자에게 알림 생성
    const notification = new Notification({
      userId: joinRequest.requester._id,
      type: 'request_accepted',
      title: '모임 참여 승인',
      message: `"${post.title}" 모임 참여가 승인되었습니다.`,
      data: {
        postId: post._id,
        requestId: joinRequest._id
      }
    });

    await notification.save();

    res.json({
      success: true,
      data: { 
        request: joinRequest,
        post: await Post.findById(post._id)
          .populate('author', 'nickname profileImageUrl')
          .populate('participants', 'nickname profileImageUrl')
      },
      message: '참여 요청이 승인되었습니다.'
    });
  } catch (error) {
    console.error('참여 요청 수락 오류:', error);
    res.status(500).json({
      success: false,
      error: '참여 요청 수락에 실패했습니다.'
    });
  }
};

/**
 * 참여 요청 거절
 * POST /api/join-requests/:requestId/reject
 */
const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const joinRequest = await JoinRequest.findById(requestId)
      .populate('post')
      .populate('requester', 'nickname profileImageUrl');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        error: '참여 요청을 찾을 수 없습니다.'
      });
    }

    // 게시글 작성자만 거절 가능
    if (joinRequest.postAuthor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '요청 거절 권한이 없습니다.'
      });
    }

    // 이미 처리된 요청인지 확인
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: '이미 처리된 요청입니다.'
      });
    }

    // 요청 상태 변경
    joinRequest.status = 'rejected';
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    // 요청자에게 알림 생성
    const notification = new Notification({
      userId: joinRequest.requester._id,
      type: 'request_rejected',
      title: '모임 참여 거절',
      message: `"${joinRequest.post.title}" 모임 참여가 거절되었습니다.`,
      data: {
        postId: joinRequest.post._id,
        requestId: joinRequest._id
      }
    });

    await notification.save();

    res.json({
      success: true,
      data: { request: joinRequest },
      message: '참여 요청이 거절되었습니다.'
    });
  } catch (error) {
    console.error('참여 요청 거절 오류:', error);
    res.status(500).json({
      success: false,
      error: '참여 요청 거절에 실패했습니다.'
    });
  }
};

/**
 * 내가 보낸 참여 요청 목록
 * GET /api/join-requests/my-requests
 */
const getMyRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ requester: req.user.id })
      .populate('post', 'title author status')
      .populate('post.author', 'nickname')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    console.error('내 요청 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '요청 목록을 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 내 게시글에 온 참여 요청 목록
 * GET /api/join-requests/received
 */
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ postAuthor: req.user.id })
      .populate('requester', 'nickname profileImageUrl')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    console.error('받은 요청 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '요청 목록을 불러오는데 실패했습니다.'
    });
  }
};

module.exports = {
  createJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  getMyRequests,
  getReceivedRequests
};