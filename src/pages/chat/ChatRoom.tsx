import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar, 
  AppBar, 
  Toolbar,
  List,
  ListItem,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip
} from "@mui/material";
import { 
  Send as SendIcon, 
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  LocationOn
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import type { ChatRoom, ChatMessage, ChatUser } from "../../types/home.types";
import { useSocket } from "../../hooks/useSocket";


export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메뉴 및 모달 상태
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // 채팅방 및 메시지 상태
  const [roomData, setRoomData] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);

  // 소켓 연결
  const { socket } = useSocket();

  // 채팅방 데이터 로드
  const loadRoomData = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      console.log('🔄 채팅방 정보 로드 중...', roomId);
      const room = await api.chat.getRoom(roomId);
      setRoomData(room);

      // 상대방 사용자 정보 설정
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const other = room.participants.find((p: ChatUser) => p.id !== currentUserId);
      setOtherUser(other || null);

      console.log('✅ 채팅방 정보 로드 완료:', room);
    } catch (error) {
      console.error('❌ 채팅방 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // 메시지 목록 로드
  const loadMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      console.log('🔄 메시지 목록 로드 중...', roomId);
      const response = await api.chat.getMessages(roomId, { limit: 50 });

      const messageList = response.messages || response.data || response || [];
      setMessages(Array.isArray(messageList) ? messageList : []);

      console.log('✅ 메시지 목록 로드 완료:', messageList);
    } catch (error) {
      console.error('❌ 메시지 목록 로드 실패:', error);
      setMessages([]);
    }
  }, [roomId]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (roomId) {
      loadRoomData();
      loadMessages();
    }
  }, [roomId, loadRoomData, loadMessages]);

  // 소켓 이벤트 처리
  useEffect(() => {
    if (!socket || !roomId) return;

    // 채팅방 입장
    socket.emit('join-room', roomId);

    // 새 메시지 수신
    const handleNewMessage = (message: ChatMessage) => {
      console.log('📨 새 메시지 수신:', message);
      setMessages(prev => [...prev, message]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.emit('leave-room', roomId);
    };
  }, [socket, roomId]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography>채팅방을 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!roomData) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography>채팅방을 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !roomId || sendingMessage) return;

    setSendingMessage(true);
    try {
      console.log('📤 메시지 전송 중...', newMessage);

      // API로 메시지 전송
      const sentMessage = await api.chat.sendMessage(roomId, newMessage.trim());

      // 채팅 메시지 알림 생성 (상대방에게)
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id && socket) {
          console.log('📢 채팅 메시지 알림 생성 중...');
          await api.notifications.createChatMessageNotification(roomId, currentUser.id, newMessage.trim());
          console.log('✅ 채팅 메시지 알림 생성 완료');
        }
      } catch (notificationError) {
        console.log('⚠️ 채팅 알림 생성 실패 (메시지는 성공):', notificationError);
      }

      // 소켓으로 실시간 전송
      if (socket) {
        socket.emit('send-message', {
          roomId,
          message: sentMessage
        });
      }

      // 로컬 상태 업데이트 (이미 소켓으로 받을 수도 있지만 즉시 반영을 위해)
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");

      console.log('✅ 메시지 전송 완료:', sentMessage);
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleBlockUser = () => {
    setBlockDialogOpen(false);
    setMenuAnchorEl(null);
    console.log("사용자 차단:", otherUser?.name);
    // TODO: 실제 차단 로직 구현
  };

  const handleReportUser = () => {
    if (reportReason) {
      setReportDialogOpen(false);
      setMenuAnchorEl(null);
      console.log("사용자 신고:", otherUser?.name, "사유:", reportReason);
      // TODO: 실제 신고 로직 구현
      setReportReason("");
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

  const handlePostClick = () => {
    // TODO: 실제 게시글 상세 페이지 라우트로 변경
    navigate(`/post/${roomData.postId}`);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    if (diffDays === -1) return '어제';
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333' }} elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ mr: 1, color: '#E762A9' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar
            src={otherUser?.avatar}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {otherUser?.name?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600} color="#333">
                {otherUser?.name || '사용자'}
              </Typography>
              <Chip
                label={getStatusText(roomData.status)}
                size="small"
                sx={{
                  bgcolor: getStatusColor(roomData.status),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 18,
                  borderRadius: 2,
                }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={roomData.postCategory}
                size="small"
                sx={{
                  bgcolor: '#E762A9',
                  color: 'white',
                  fontSize: '0.6rem',
                  height: 16,
                  borderRadius: 1,
                }}
              />
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn sx={{ fontSize: 10, color: '#E762A9' }} />
                <Typography variant="caption" color="#E762A9">
                  {roomData.postLocation}
                </Typography>
              </Box>
              {roomData.meetingDate && (
                <Typography variant="caption" color="text.secondary">
                  • {new Date(roomData.meetingDate).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen} sx={{ color: '#E762A9' }}>
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 간소화된 모임 정보 */}
      <Paper
        onClick={handlePostClick}
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e8ecef',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#f1f3f5',
          }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5} flex={1}>
            {/* 이미지 썸네일 (작게) */}
            {roomData.postImage && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundImage: `url(${roomData.postImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0
                }}
              />
            )}
            
            <Box flex={1} minWidth={0}>
              {/* 제목과 카테고리 */}
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="subtitle2" fontWeight={600} color="#333" noWrap>
                  {roomData.postTitle}
                </Typography>
                <Chip
                  label={roomData.postCategory}
                  size="small"
                  sx={{
                    bgcolor: '#E762A9',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 18,
                    borderRadius: 1,
                    fontWeight: 500,
                    flexShrink: 0
                  }}
                />
              </Box>
              
              {/* 핵심 정보 */}
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationOn sx={{ fontSize: 14, color: '#E762A9' }} />
                  <Typography variant="caption" color="#E762A9" fontWeight={500}>
                    {roomData.venue}
                  </Typography>
                </Box>
                {roomData.meetingDate && (
                  <Typography variant="caption" color="text.secondary">
                    📅 {formatDateTime(roomData.meetingDate)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* 상태 및 힌트 */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
              터치하여 보기
            </Typography>
            <Typography variant="caption" 
              sx={{ 
                bgcolor: roomData.isMyPost ? '#E3F2FD' : '#FFF3E0',
                color: roomData.isMyPost ? '#1976D2' : '#F57C00',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 600,
                fontSize: '0.65rem'
              }}
            >
              {roomData.isMyPost ? '내작성' : '참여중'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <ListItem 
              key={message.id}
              sx={{ 
                display: 'flex',
                justifyContent: message.isMe ? 'flex-end' : 'flex-start',
                mb: 1,
                px: 1
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: message.isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  maxWidth: '70%',
                  gap: 1
                }}
              >
                {!message.isMe && (
                  <Avatar
                    src={message.sender.avatar}
                    sx={{ width: 32, height: 32 }}
                  >
                    {message.sender.name?.charAt(0) || '?'}
                  </Avatar>
                )}
                <Box>
                  {!message.isMe && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, mb: 0.5, display: 'block' }}
                    >
                      {message.sender.name}
                    </Typography>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: message.isMe ? '#E762A9' : '#f5f5f5',
                      color: message.isMe ? 'white' : '#333',
                      borderRadius: 2,
                      borderTopLeftRadius: message.isMe ? 2 : 0.5,
                      borderTopRightRadius: message.isMe ? 0.5 : 2,
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      ml: message.isMe ? 0 : 1,
                      mr: message.isMe ? 1 : 0,
                      mt: 0.5,
                      display: 'block',
                      textAlign: message.isMe ? 'right' : 'left'
                    }}
                  >
                    {new Date(message.timestamp || message.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'flex-end',
          gap: 1,
          borderRadius: 0
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            }
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={newMessage.trim() === "" || sendingMessage}
          sx={{
            bgcolor: '#E762A9',
            color: 'white',
            '&:hover': {
              bgcolor: '#D554A0',
            },
            '&:disabled': {
              bgcolor: 'grey.300',
              color: 'grey.500',
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>

      {/* 메뉴 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <MenuItem 
          onClick={() => {
            setReportDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: '#ff9800' }}
        >
          <ReportIcon sx={{ mr: 1, fontSize: 20 }} />
          신고하기
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setBlockDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: '#f44336' }}
        >
          <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
          차단하기
        </MenuItem>
      </Menu>

      {/* 차단 확인 다이얼로그 */}
      <Dialog 
        open={blockDialogOpen} 
        onClose={() => setBlockDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          사용자 차단
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            <strong>{otherUser?.name}</strong>님을 차단하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 차단된 사용자와는 대화할 수 없습니다<br/>
            • 차단은 나의 설정에서 해제할 수 있습니다
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBlockDialogOpen(false)}
            sx={{ color: '#666' }}
          >
            취소
          </Button>
          <Button 
            onClick={handleBlockUser} 
            variant="contained"
            sx={{ 
              bgcolor: '#f44336',
              '&:hover': { bgcolor: '#d32f2f' }
            }}
          >
            차단하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 신고 다이얼로그 */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          사용자 신고
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            <strong>{otherUser?.name}</strong>님을 신고하는 이유를 선택해주세요
          </Typography>
          <FormControl>
            <RadioGroup
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <FormControlLabel 
                value="spam" 
                control={<Radio sx={{ color: '#E762A9', '&.Mui-checked': { color: '#E762A9' } }} />} 
                label="스팸/광고성 메시지" 
              />
              <FormControlLabel 
                value="harassment" 
                control={<Radio sx={{ color: '#E762A9', '&.Mui-checked': { color: '#E762A9' } }} />} 
                label="괴롭힘/욕설" 
              />
              <FormControlLabel 
                value="inappropriate" 
                control={<Radio sx={{ color: '#E762A9', '&.Mui-checked': { color: '#E762A9' } }} />} 
                label="부적절한 내용" 
              />
              <FormControlLabel 
                value="fraud" 
                control={<Radio sx={{ color: '#E762A9', '&.Mui-checked': { color: '#E762A9' } }} />} 
                label="사기/허위정보" 
              />
              <FormControlLabel 
                value="other" 
                control={<Radio sx={{ color: '#E762A9', '&.Mui-checked': { color: '#E762A9' } }} />} 
                label="기타" 
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setReportDialogOpen(false);
              setReportReason("");
            }}
            sx={{ color: '#666' }}
          >
            취소
          </Button>
          <Button 
            onClick={handleReportUser}
            disabled={!reportReason}
            variant="contained"
            sx={{ 
              bgcolor: '#ff9800',
              '&:hover': { bgcolor: '#f57c00' }
            }}
          >
            신고하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


