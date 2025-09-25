// MUI 아이콘
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton } from "@mui/material";


// MUI 컴포넌트
import {
  Card,
  Typography,
  Box,
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
import { getCategoryDisplay, getCategoryName } from "../utils/hardcodedCategories";
import { useState } from "react";
import { useBlockUser } from "../contexts/BlockUserContext";
import { useAuth } from "../auth/AuthContext";
import { PostJoinAction } from "./PostJoinAction";
import UserProfileModal from "./UserProfileModal";

/**
 * PostCard 컴포넌트 Props 정의
 */
interface PostCardProps {
  post: Post; // 게시글 데이터
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
  onUserBlock,
  onEditPost,
  onDeletePost
}: PostCardProps) {
  const { user } = useAuth();
  const { isUserBlocked, unblockUser } = useBlockUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isBlocked = isUserBlocked(post.authorId);
  const isMyPost = user && (user.email === post.author || user.id === post.authorId);
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
        // 상위 컴포넌트에서 차단 처리하도록 콜백만 호출
        onUserBlock?.(post.authorId, post.author);
        alert(`${post.author} 사용자가 차단되었습니다.`);
      } catch {
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
      } catch {
        alert('차단 해제에 실패했습니다.');
      } finally {
        setIsBlocking(false);
        handleMenuClose();
      }
    }
  };

  // 이미지 네비게이션 함수
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const images = Array.isArray(post.image) ? post.image : [post.image];
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const images = Array.isArray(post.image) ? post.image : [post.image];
    setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
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
      {/* 모든 게시글에 이미지 영역 표시 (사용자 이미지 또는 기본 이미지) */}
      {(
        <Box sx={{ height: 250, overflow: "hidden", position: "relative" }}>
          {(() => {

            // 카테고리별 기본 이미지 함수
            const getDefaultImages = (categoryName: string): string[] => {
              const defaultImages: { [key: string]: string[] } = {
                '자기계발': [
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop&crop=center'
                ],
                '봉사활동': [
                  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop&crop=center'
                ],
                '운동/스포츠': [
                  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop&crop=center'
                ],
                '문화/예술': [
                  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&crop=center'
                ],
                '사교/인맥': [
                  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center'
                ],
                '취미': [
                  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=300&fit=crop&crop=center'
                ],
                '외국어': [
                  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&fit=crop&crop=center'
                ],
                '맛집': [
                  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?w=400&h=300&fit=crop&crop=center'
                ],
                '반려동물': [
                  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center'
                ],
                'default': [
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop&crop=center',
                  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&crop=center'
                ]
              };
              return defaultImages[categoryName] || defaultImages['default'];
            };

            // 실제 이미지가 있으면 사용, 없으면 카테고리별 기본 이미지의 첫 번째만 사용
            let images: string[];
            if (post.image && Array.isArray(post.image) && post.image.length > 0) {
              // 사용자가 업로드한 실제 이미지들 (배열)
              images = post.image;
            } else if (post.image && typeof post.image === 'string' && post.image.trim() !== '') {
              // 사용자가 업로드한 실제 이미지 (단일)
              images = [post.image];
            } else {
              // 기본 이미지는 첫 번째 이미지만 사용 (스와이핑 없음)
              const categoryName = getCategoryName(post.category);
              const defaultImages = getDefaultImages(categoryName);
              images = [defaultImages[0]]; // 첫 번째 이미지만 사용
            }

            const currentImage = images[currentImageIndex] || images[0];

            return (
              <>
                <img
                  src={currentImage}
                  alt={post.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                  loading="lazy"
                />

                {/* 이미지가 여러 개일 때만 네비게이션 버튼 표시 */}
                {images.length > 1 && (
                  <>
                    {/* 이전 이미지 버튼 */}
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        width: 36,
                        height: 36,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.7)",
                        },
                        zIndex: 2,
                      }}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>

                    {/* 다음 이미지 버튼 */}
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        width: 36,
                        height: 36,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.7)",
                        },
                        zIndex: 2,
                      }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>

                    {/* 이미지 인디케이터 */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 0.5,
                        zIndex: 2,
                      }}
                    >
                      {images.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: index === currentImageIndex
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(255,255,255,0.4)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </>
            );
          })()}
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
              {getCategoryDisplay(post.category)}
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
                key={`tag-${tag}-${index}`}
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
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          {!isMyPost && (
            <PostJoinAction
              postId={post.id}
              disabled={post.status === 'full'}
              authorId={post.authorId}
            />
          )}
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
{isMyPost ? [
          // 내가 쓴 글일 때 수정/삭제 메뉴
          <MenuItem key="edit" onClick={() => {
            handleMenuClose();
            onEditPost?.(post.id);
          }}>
            <ListItemIcon>
              <EditIcon color="primary" />
            </ListItemIcon>
            <ListItemText>수정</ListItemText>
          </MenuItem>,
          <MenuItem key="delete" onClick={() => {
            handleMenuClose();
            onDeletePost?.(post.id);
          }}>
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText>삭제</ListItemText>
          </MenuItem>
        ] : [
          // 다른 사람 글일 때 프로필 보기/차단 메뉴
          <MenuItem key="profile" onClick={handleShowProfile}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText>프로필 보기</ListItemText>
          </MenuItem>,
          isBlocked ? (
            <MenuItem key="unblock" onClick={handleUnblockUser} disabled={isBlocking}>
              <ListItemIcon>
                <PersonIcon color="success" />
              </ListItemIcon>
              <ListItemText>차단 해제</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem key="block" onClick={handleBlockUser} disabled={isBlocking}>
              <ListItemIcon>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText>사용자 차단</ListItemText>
            </MenuItem>
          )
        ]}
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