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
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isMe: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "안녕하세요! 저녁 같이 드실 분 찾고 있어요",
    sender: { id: "user1", name: "김잇플" },
    timestamp: "10:00",
    isMe: false,
  },
  {
    id: "2", 
    text: "안녕하세요! 5시에 만날까요?",
    sender: { id: "me", name: "나" },
    timestamp: "10:01",
    isMe: true,
  },
  {
    id: "3",
    text: "좋아요! 홍대입구역 2번 출구에서 만나요",
    sender: { id: "user1", name: "김잇플" },
    timestamp: "10:30",
    isMe: false,
  },
];

const chatRoomData: { [key: string]: any } = {
  "1": {
    postId: "post-1",
    postTitle: "저녁 같이 먹을 사람?",
    postContent: "혼밥 싫어서 같이 드실 분 구해요! 맛있는 피자 같이 먹어요",
    postCategory: "식사",
    postLocation: "홍대입구",
    venue: "홍대입구역 2번 출구 피자집",
    meetingDate: "2024-12-20T17:00:00",
    maxParticipants: 4,
    currentParticipants: 2,
    postImage: "https://picsum.photos/seed/pizza/400/200",
    isMyPost: false, // 내가 작성한 게시글인지
    otherUser: { id: "user1", name: "김잇플", avatar: "https://picsum.photos/seed/user1/40/40" },
    status: 'active'
  },
  "2": {
    postId: "post-2",
    postTitle: "카페에서 수다떨어요",
    postContent: "근처 카페에서 커피 마시며 대화해요. 디저트도 같이!",
    postCategory: "카페", 
    postLocation: "강남",
    venue: "강남역 스타벅스",
    meetingDate: "2024-12-19T15:00:00",
    maxParticipants: 3,
    currentParticipants: 2,
    isMyPost: true, // 내가 작성한 게시글
    otherUser: { id: "user2", name: "박카페" },
    status: 'completed'
  },
  "3": {
    postId: "post-3",
    postTitle: "쇼핑 같이 해요",
    postContent: "쇼핑하면서 구경하실 분! 같이 다녀요",
    postCategory: "쇼핑",
    postLocation: "명동", 
    venue: "명동 쇼핑거리",
    meetingDate: "2024-12-21T14:00:00",
    maxParticipants: 5,
    currentParticipants: 3,
    postImage: "https://picsum.photos/seed/shopping/400/200",
    isMyPost: false,
    otherUser: { id: "user3", name: "최쇼핑", avatar: "https://picsum.photos/seed/user3/40/40" },
    status: 'active'
  },
};

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메뉴 및 모달 상태
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const roomData = roomId ? chatRoomData[roomId] : null;
  
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

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: { id: "me", name: "나" },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
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
    console.log("사용자 차단:", roomData.otherUser.name);
    // TODO: 실제 차단 로직 구현
  };

  const handleReportUser = () => {
    if (reportReason) {
      setReportDialogOpen(false);
      setMenuAnchorEl(null);
      console.log("사용자 신고:", roomData.otherUser.name, "사유:", reportReason);
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
            src={roomData.otherUser.avatar}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {roomData.otherUser.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600} color="#333">
                {roomData.otherUser.name}
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
                  • {roomData.meetingDate}
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
                    📅 {formatDateTime(roomData.meetingDate)} {new Date(roomData.meetingDate).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
                    {message.sender.name.charAt(0)}
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
                    {message.timestamp}
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
          disabled={newMessage.trim() === ""}
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
            <strong>{roomData.otherUser.name}</strong>님을 차단하시겠습니까?
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
            <strong>{roomData.otherUser.name}</strong>님을 신고하는 이유를 선택해주세요
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


