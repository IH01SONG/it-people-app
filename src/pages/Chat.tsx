import { Box, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Badge, Card, Chip, CircularProgress } from "@mui/material";
import { ChatBubbleOutline, LocationOn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../utils/api";
import socketManager from "../utils/socket";
import AppHeader from "../components/AppHeader";

interface ChatRoomData {
  _id: string;
  type: "post" | "direct";
  participants: Array<{
    _id: string;
    nickname: string;
    email: string;
    profileImageUrl?: string;
  }>;
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
  };
  postId?: {
    _id: string;
    title: string;
    content: string;
  };
  lastActivity: string;
  isActive: boolean;
}

// Mock 데이터는 제거하고 서버에서 가져올 예정

export default function Chat() {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState<ChatRoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 채팅방 목록 로드
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setLoading(true);
        
        // 현재 사용자 정보 가져오기
        const userResponse = await api.auth.getMe();
        if (userResponse.success && userResponse.user) {
          setCurrentUser(userResponse.user);
          
          // Socket 연결 및 사용자 등록
          socketManager.register(userResponse.user.id);
        }

        // 채팅방 목록 가져오기
        const roomsResponse = await api.chat.getRooms();
        if (roomsResponse.success && roomsResponse.data) {
          setChatRooms(roomsResponse.data);
        }
      } catch (error) {
        console.error('채팅방 목록 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatRooms();
  }, []);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/room/${chatId}`);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getOtherParticipant = (room: ChatRoomData) => {
    return room.participants.find(p => p._id !== currentUser?.id);
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
    <div className="w-full max-w-md mx-auto bg-white min-h-screen">
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
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh'
            }}
          >
            <CircularProgress />
          </Box>
        ) : chatRooms.length === 0 ? (
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
              const otherUser = getOtherParticipant(room);
              return (
                <Card
                  key={room._id}
                  onClick={() => handleChatClick(room._id)}
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
                            label={room.type === 'post' ? '모임' : '1:1'}
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
                          {room.postId && (
                            <Typography variant="caption" color="#E762A9" fontWeight={500}>
                              📍 모임 채팅
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} color="#333" mb={0.5}>
                          {room.postId ? room.postId.title : `${otherUser?.nickname || '알 수 없음'}와의 대화`}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={room.isActive ? '진행중' : '종료됨'}
                          size="small"
                          sx={{
                            bgcolor: room.isActive ? '#4CAF50' : '#FF9800',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 18,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 사용자 정보 및 메시지 */}
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar 
                        src={otherUser?.profileImageUrl}
                        sx={{ width: 40, height: 40 }}
                      >
                        {otherUser?.nickname.charAt(0) || '?'}
                      </Avatar>
                      <Box flex={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="subtitle2" fontWeight={600} color="#333">
                            {otherUser?.nickname || '알 수 없음'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {room.lastMessage ? formatLastMessageTime(room.lastMessage.createdAt) : formatLastMessageTime(room.lastActivity)}
                          </Typography>
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
                          {room.lastMessage?.content || '메시지가 없습니다'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
