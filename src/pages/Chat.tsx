import { Box, Typography, Avatar, Badge, Card, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { ChatBubbleOutline, LocationOn, MoreVert, Block, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppHeader from "../components/AppHeader";
import { useBlockUser } from "../contexts/BlockUserContext";
import UserProfileModal from "../components/UserProfileModal";

interface ItplChat {
  id: string;
  postTitle: string;
  postCategory: string;
  postLocation: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'completed' | 'blocked';
  meetingDate?: string;
}

const mockItplChats: ItplChat[] = [
  {
    id: "1",
    postTitle: "저녁 같이 먹을 사람?",
    postCategory: "식사",
    postLocation: "홍대입구",
    otherUser: {
      id: "user1",
      name: "김잇플",
      avatar: "https://picsum.photos/seed/user1/40/40",
    },
    lastMessage: "홍대입구역 2번 출구에서 만나요",
    lastMessageTime: "10분 전",
    unreadCount: 2,
    status: 'active',
    meetingDate: "오늘 17:00",
  },
  {
    id: "2", 
    postTitle: "카페에서 수다떨어요",
    postCategory: "카페",
    postLocation: "강남",
    otherUser: {
      id: "user2",
      name: "박카페",
    },
    lastMessage: "감사했습니다! 다음에 또 만나요",
    lastMessageTime: "어제",
    unreadCount: 0,
    status: 'completed',
  },
  {
    id: "3",
    postTitle: "쇼핑 같이 해요",
    postCategory: "쇼핑",
    postLocation: "명동",
    otherUser: {
      id: "user3",
      name: "최쇼핑",
      avatar: "https://picsum.photos/seed/user3/40/40",
    },
    lastMessage: "언제 시간 되세요?",
    lastMessageTime: "1시간 전",
    unreadCount: 1,
    status: 'active',
    meetingDate: "내일 14:00",
  },
];

export default function Chat() {
  const navigate = useNavigate();
  const { isUserBlocked, blockUser, unblockUser } = useBlockUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, email?: string} | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/room/${chatId}`);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>, user: {id: string, name: string, email?: string}) => {
    event.stopPropagation();
    setSelectedUser(user);
    setAnchorEl(event.currentTarget);
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

        {/* Chat List */}
        {mockItplChats.length === 0 ? (
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
            {mockItplChats.map((chat) => (
              <Card
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
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
                          label={chat.postCategory}
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
                            {chat.postLocation}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} color="#333" mb={0.5}>
                        {chat.postTitle}
                      </Typography>
                      {chat.meetingDate && (
                        <Typography variant="caption" color="text.secondary">
                          약속: {chat.meetingDate}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={getStatusText(chat.status)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(chat.status),
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 18,
                          borderRadius: 2,
                        }}
                      />
                      {chat.unreadCount > 0 && (
                        <Badge 
                          badgeContent={chat.unreadCount} 
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
                      src={chat.otherUser.avatar}
                      sx={{ width: 40, height: 40 }}
                    >
                      {chat.otherUser.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={600} 
                            color="#333"
                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={(e) => handleUserClick(e, chat.otherUser)}
                          >
                            {chat.otherUser.name}
                          </Typography>
                          {isUserBlocked(chat.otherUser.id) && (
                            <Typography variant="caption" color="error.main" fontWeight={500}>
                              (차단됨)
                            </Typography>
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            {chat.lastMessageTime}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleUserClick(e, chat.otherUser)}
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
                        {chat.lastMessage}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
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
