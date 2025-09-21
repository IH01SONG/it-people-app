import { Box, Typography, Avatar, Badge, Card, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import { ChatBubbleOutline, LocationOn, MoreVert, Block, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import AppHeader from "../components/AppHeader";
import { useBlockUser } from "../contexts/BlockUserContext";
import UserProfileModal from "../components/UserProfileModal";
import { api } from "../lib/api";
import type { ChatRoom } from "../types/home.types";


export default function Chat() {
  const navigate = useNavigate();
  const { isUserBlocked, blockUser, unblockUser } = useBlockUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, email?: string} | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  // 채팅방 목록 상태
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 채팅방 목록 로드
  const loadChatRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 채팅방 목록 로드 중...');
      const response = await api.chat.getRooms();

      if (response && Array.isArray(response)) {
        setChatRooms(response);
      } else if (response && response.rooms) {
        setChatRooms(response.rooms);
      } else {
        setChatRooms([]);
      }

      console.log('✅ 채팅방 목록 로드 완료:', response);
      console.log('💡 첫 번째 채팅방 구조:', response[0]);
    } catch (error) {
      console.error('❌ 채팅방 목록 로드 실패:', error);
      setError('채팅방 목록을 불러올 수 없습니다.');
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 채팅방 목록 로드
  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/room/${chatId}`);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>, user: {id: string, name: string, email?: string}) => {
    event.stopPropagation();
    setSelectedUser(user);
    setAnchorEl(event.currentTarget);
  };

  // 상대방 사용자 정보 추출
  const getOtherUser = (room: ChatRoom) => {
    try {
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const otherUser = room.participants?.find(participant => participant.id !== currentUserId);

      // 상대방을 찾지 못했거나 participants가 없는 경우 기본값 반환
      if (!otherUser && room.participants?.length > 0) {
        return room.participants[0];
      }

      // 기본 사용자 객체 반환 (name이 없는 경우 대비)
      return otherUser || {
        id: 'unknown',
        name: '알 수 없는 사용자',
        nickname: '',
        email: '',
        avatar: ''
      };
    } catch (error) {
      console.error('getOtherUser 에러:', error);
      return {
        id: 'unknown',
        name: '알 수 없는 사용자',
        nickname: '',
        email: '',
        avatar: ''
      };
    }
  };

  // 시간 포맷팅
  const formatLastMessageTime = (timestamp: string) => {
    try {
      if (!timestamp) return '';

      const now = new Date();
      const messageTime = new Date(timestamp);

      // 유효하지 않은 날짜인 경우
      if (isNaN(messageTime.getTime())) return '';

      const diffMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
      if (diffMinutes < 2880) return '어제';
      return messageTime.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('시간 포맷팅 에러:', error);
      return '';
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleShowProfile = () => {
    setShowProfileModal(true);
    handleMenuClose();
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    if (window.confirm(`${selectedUser.name} 사용자를 차단하시겠습니까?`)) {
      setIsBlocking(true);
      try {
        await blockUser(selectedUser.id, selectedUser.name, selectedUser.email);
        alert(`${selectedUser.name} 사용자가 차단되었습니다.`);
      } catch (error) {
        alert('사용자 차단에 실패했습니다.');
      } finally {
        setIsBlocking(false);
        handleMenuClose();
      }
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUser) return;
    
    if (window.confirm(`${selectedUser.name} 사용자의 차단을 해제하시겠습니까?`)) {
      setIsBlocking(true);
      try {
        await unblockUser(selectedUser.id);
        alert(`${selectedUser.name} 사용자의 차단이 해제되었습니다.`);
      } catch (error) {
        alert('차단 해제에 실패했습니다.');
      } finally {
        setIsBlocking(false);
        handleMenuClose();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      case 'blocked': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'blocked': return '차단됨';
      default: return '';
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px", // Step2와 동일
        margin: "0 auto",
      }}
    >
      <AppHeader />
      
      <div className="px-4 pb-24">
        {/* 페이지 제목 */}
        <Box sx={{ py: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={700} color="#333" mb={0.5}>
            잇플 채팅
          </Typography>
          <Typography variant="body2" color="text.secondary">
            매칭된 사람들과의 대화를 확인해보세요
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#E762A9' }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh',
              p: 3
            }}
          >
            <Typography variant="h6" color="error" textAlign="center" mb={1}>
              오류가 발생했습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
              {error}
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={loadChatRooms}
            >
              다시 시도
            </Typography>
          </Box>
        )}

        {/* Chat List */}
        {!loading && !error && chatRooms.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '50vh',
              p: 3 
            }}
          >
            <ChatBubbleOutline sx={{ fontSize: 64, color: '#E762A9', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" textAlign="center" mb={1}>
              아직 매칭된 대화가 없어요
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              모임에 참여해서 새로운 사람들과 대화를 시작해보세요
            </Typography>
          </Box>
        ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => {
              const otherUser = getOtherUser(room);
              return (
              <Card
                key={room.id}
                onClick={() => handleChatClick(room.id)}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(231, 98, 169, 0.08)",
                  border: "1px solid rgba(231, 98, 169, 0.1)",
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: "0 4px 20px rgba(231, 98, 169, 0.15)",
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Box p={3}>
                  {/* 모임 정보 헤더 */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Chip
                          label={room.postCategory}
                          size="small"
                          sx={{
                            bgcolor: '#E762A9',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        />
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOn sx={{ fontSize: 12, color: '#E762A9' }} />
                          <Typography variant="caption" color="#E762A9" fontWeight={500}>
                            {room.postLocation}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} color="#333" mb={0.5}>
                        {room.postTitle}
                      </Typography>
                      {room.meetingDate && (
                        <Typography variant="caption" color="text.secondary">
                          약속: {new Date(room.meetingDate).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={getStatusText(room.status)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(room.status),
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 18,
                          borderRadius: 2,
                        }}
                      />
                      {room.unreadCount > 0 && (
                        <Badge
                          badgeContent={room.unreadCount}
                          sx={{
                            '& .MuiBadge-badge': {
                              bgcolor: '#E762A9',
                              color: 'white',
                              minWidth: '18px',
                              height: '18px',
                              fontSize: '0.7rem'
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* 사용자 정보 및 메시지 */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={otherUser.avatar}
                      sx={{ width: 40, height: 40 }}
                    >
                      {otherUser.name?.charAt(0) || '?'}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="#333"
                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={(e) => handleUserClick(e, otherUser)}
                          >
                            {otherUser.name || '알 수 없는 사용자'}
                          </Typography>
                          {isUserBlocked(otherUser.id) && (
                            <Typography variant="caption" color="error.main" fontWeight={500}>
                              (차단됨)
                            </Typography>
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            {room.lastMessage ? formatLastMessageTime(room.lastMessage.timestamp) : ''}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleUserClick(e, otherUser)}
                            sx={{ p: 0.5 }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {room.lastMessage?.text || '메시지가 없습니다.'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
              );
            })}
          </div>
        )}

        {/* 사용자 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
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
          <MenuItem onClick={handleShowProfile}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText>프로필 보기</ListItemText>
          </MenuItem>
          {selectedUser && isUserBlocked(selectedUser.id) ? (
            <MenuItem onClick={handleUnblockUser} disabled={isBlocking}>
              <ListItemIcon>
                <Person color="success" />
              </ListItemIcon>
              <ListItemText>차단 해제</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={handleBlockUser} disabled={isBlocking}>
              <ListItemIcon>
                <Block color="error" />
              </ListItemIcon>
              <ListItemText>사용자 차단</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* 사용자 프로필 모달 */}
        <UserProfileModal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={selectedUser}
        />
      </div>
    </Box>
  );
}
