// MUI 아이콘
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// 로고 이미지
import logoSvg from "../assets/logo.png";

// MUI 컴포넌트
import {
  Card,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import PersonIcon from "@mui/icons-material/Person";

// 타입 정의
import type { Post } from "../types/home.types";
import { useState } from "react";
import { useBlockUser } from "../contexts/BlockUserContext";
import { useAuth } from "../auth/AuthContext";
import UserProfileModal from "./UserProfileModal";

/**
 * PostCard 컴포넌트 Props 정의
 */
interface PostCardProps {
  post: Post; // 게시글 데이터
  onJoinRequest: (postId: string) => void; // 참여 신청 콜백
  isApplied?: boolean; // 신청 상태
  onUserBlock?: (userId: string, userName: string) => void; // 사용자 차단 콜백
  onEditPost?: (postId: string) => void; // 게시글 수정 콜백
  onDeletePost?: (postId: string) => void; // 게시글 삭제 콜백
}

/**
 * 게시글 카드 컴포넌트
 * 모임 게시글의 정보를 카드 형태로 표시하고 참여 신청 기능을 제공
 */
export default function PostCard({
  post,
  onJoinRequest,
  isApplied = false,
  onUserBlock,
  onEditPost,
  onDeletePost
}: PostCardProps) {
  const { user } = useAuth();
  const { isUserBlocked, blockUser, unblockUser } = useBlockUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const isBlocked = isUserBlocked(post.authorId);
  const isMyPost = user && (user.email === post.author || user.id === post.authorId || user._id === post.authorId);
  const menuOpen = Boolean(anchorEl);

  const handleAuthorClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShowProfile = () => {
    setShowProfileModal(true);
    handleMenuClose();
  };

  const handleBlockUser = async () => {
    if (window.confirm(`${post.author} 사용자를 차단하시겠습니까?`)) {
      setIsBlocking(true);
      try {
        await blockUser(post.authorId, post.author);
        onUserBlock?.(post.authorId, post.author);
        alert(`${post.author} 사용자가 차단되었습니다.`);
      } catch (error) {
        alert('사용자 차단에 실패했습니다.');
      } finally {
        setIsBlocking(false);
        handleMenuClose();
      }
    }
  };

  const handleUnblockUser = async () => {
    if (window.confirm(`${post.author} 사용자의 차단을 해제하시겠습니까?`)) {
      setIsBlocking(true);
      try {
        await unblockUser(post.authorId);
        alert(`${post.author} 사용자의 차단이 해제되었습니다.`);
      } catch (error) {
        alert('차단 해제에 실패했습니다.');
      } finally {
        setIsBlocking(false);
        handleMenuClose();
      }
    }
  };
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {post.image && (
        <Box sx={{ height: 200, overflow: "hidden" }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      <Box p={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                {post.author.charAt(0)}
              </Avatar>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={handleAuthorClick}
              >
                {post.author}
              </Typography>
              {isBlocked && (
                <Typography variant="caption" color="error.main" fontWeight={500}>
                  (차단됨)
                </Typography>
              )}
            </Box>
            <span className="text-xs text-gray-400">•</span>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOnIcon sx={{ fontSize: 12, color: "#E91E63" }} />
              <Typography
                variant="caption"
                color="#E91E63"
                fontWeight={500}
              >
                {post.location.address || `${post.location.coordinates[1].toFixed(3)}, ${post.location.coordinates[0].toFixed(3)}`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={0.5} alignItems="center">
            <span
              className={`text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700`}
            >
              {post.category}
            </span>
            {post.status === 'full' && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                마감
              </span>
            )}
          </Box>
        </Box>

        <Typography
          variant="h6"
          fontWeight={600}
          color="#333"
          mb={1}
          lineHeight={1.3}
        >
          {post.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={1}
          lineHeight={1.5}
        >
          {post.content}
        </Typography>
        
        {/* 태그 표시 */}
        {post.tags && post.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </Box>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <span className="text-xs text-gray-500">인원</span>
              <Typography variant="caption" color="text.secondary">
                {post.participants.length}/{post.maxParticipants}명
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                조회 {post.viewCount}
              </Typography>
              <span className="text-xs text-gray-400">•</span>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={() => onJoinRequest(post.id)}
            sx={{
              bgcolor: isApplied ? "#C2185B" : "#E91E63",
              color: "white",
              borderRadius: 20,
              px: 2,
              py: 0.5,
              fontSize: "0.8rem",
              fontWeight: 600,
              minWidth: "auto",
              "&:hover": {
                bgcolor: isApplied ? "#9C1346" : "#C2185B",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(233, 30, 99, 0.3)",
            }}
            startIcon={
              <img 
                src={logoSvg} 
                alt="잇플 로고" 
                style={{ 
                  width: "14px", 
                  height: "14px",
                  filter: "brightness(0) invert(1)"
                }} 
              />
            }
          >
            잇플
          </Button>
        </Box>
      </Box>

      {/* 사용자 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {isMyPost ? (
          // 내가 쓴 글일 때 수정/삭제 메뉴
          <>
            <MenuItem onClick={() => {
              handleMenuClose();
              onEditPost && onEditPost(post.id);
            }}>
              <ListItemIcon>
                <EditIcon color="primary" />
              </ListItemIcon>
              <ListItemText>수정</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              onDeletePost && onDeletePost(post.id);
            }}>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText>삭제</ListItemText>
            </MenuItem>
          </>
        ) : (
          // 다른 사람 글일 때 프로필 보기/차단 메뉴
          <>
            <MenuItem onClick={handleShowProfile}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText>프로필 보기</ListItemText>
            </MenuItem>
            {isBlocked ? (
              <MenuItem onClick={handleUnblockUser} disabled={isBlocking}>
                <ListItemIcon>
                  <PersonIcon color="success" />
                </ListItemIcon>
                <ListItemText>차단 해제</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem onClick={handleBlockUser} disabled={isBlocking}>
                <ListItemIcon>
                  <BlockIcon color="error" />
                </ListItemIcon>
                <ListItemText>사용자 차단</ListItemText>
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      {/* 사용자 프로필 모달 */}
      <UserProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={{
          id: post.authorId,
          name: post.author,
          email: undefined, // 게시글에서는 이메일 정보가 없음
        }}
        onUserBlock={onUserBlock}
      />
    </Card>
  );
}