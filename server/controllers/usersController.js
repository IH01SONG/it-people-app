const User = require('../models/User');
const Post = require('../models/Post');

/**
 * 내 정보 조회
 * GET /api/users/me
 */
const getMyProfile = async (req, res) => {
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
          notificationSettings: user.notificationSettings,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 정보를 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 프로필 수정
 * PUT /api/users/me
 */
const updateMyProfile = async (req, res) => {
  try {
    const { nickname, profileImageUrl, interestedTags, preferredCategories } = req.body;
    
    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;
    if (interestedTags) updateData.interestedTags = interestedTags;
    if (preferredCategories) updateData.preferredCategories = preferredCategories;

    // 닉네임 중복 확인 (변경하는 경우)
    if (nickname) {
      const existingUser = await User.findOne({ 
        nickname, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '이미 존재하는 닉네임입니다.'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          profileImageUrl: updatedUser.profileImageUrl,
          interestedTags: updatedUser.interestedTags,
          preferredCategories: updatedUser.preferredCategories
        }
      },
      message: '프로필이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 수정에 실패했습니다.'
    });
  }
};

/**
 * 내가 쓴 게시글 조회
 * GET /api/users/me/posts
 */
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'nickname profileImageUrl')
      .populate('participants', 'nickname profileImageUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('내 게시글 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '내 게시글을 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 참여한 모임 조회
 * GET /api/users/me/joined-posts
 */
const getJoinedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 
      participants: req.user.id,
      author: { $ne: req.user.id } // 내가 만든 게시글 제외
    })
    .populate('author', 'nickname profileImageUrl')
    .populate('participants', 'nickname profileImageUrl')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('참여 모임 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '참여 모임을 불러오는데 실패했습니다.'
    });
  }
};

/**
 * 사용자 차단
 * POST /api/users/block/:userId
 */
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: '자기 자신을 차단할 수 없습니다.'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '이미 차단된 사용자입니다.'
      });
    }

    user.blockedUsers.push(userId);
    await user.save();

    res.json({
      success: true,
      message: '사용자가 차단되었습니다.'
    });
  } catch (error) {
    console.error('사용자 차단 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 차단에 실패했습니다.'
    });
  }
};

/**
 * 사용자 차단 해제
 * DELETE /api/users/block/:userId
 */
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '차단되지 않은 사용자입니다.'
      });
    }

    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== userId
    );
    await user.save();

    res.json({
      success: true,
      message: '사용자 차단이 해제되었습니다.'
    });
  } catch (error) {
    console.error('사용자 차단 해제 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 차단 해제에 실패했습니다.'
    });
  }
};

/**
 * 알림 설정 수정
 * PUT /api/users/me/notification-settings
 */
const updateNotificationSettings = async (req, res) => {
  try {
    const { notificationSettings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationSettings },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        notificationSettings: user.notificationSettings
      },
      message: '알림 설정이 수정되었습니다.'
    });
  } catch (error) {
    console.error('알림 설정 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '알림 설정 수정에 실패했습니다.'
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyPosts,
  getJoinedPosts,
  blockUser,
  unblockUser,
  updateNotificationSettings
};