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
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  LocationOn,
  ExitToApp as ExitToAppIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { api } from "../../utils/api";
import socketManager from "../../utils/socket";

interface Message {
  _id: string;
  content: string;
  type: "text" | "image" | "file";
  sender: {
    _id: string;
    nickname: string;
    email: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  isMe?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface ChatRoom {
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

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomData, setRoomData] = useState<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메뉴 및 모달 상태
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  
  // 플러스 메뉴 상태
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 이미지 URL 다이얼로그 상태
  const [imageUrlDialogOpen, setImageUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 현재 사용자 정보 및 채팅 데이터 로딩
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoading(true);
        
        // 현재 사용자 정보 가져오기
        const userResponse = await api.auth.getMe();
        if (userResponse.success && userResponse.user) {
          setCurrentUser(userResponse.user);
          
          // Socket 연결 및 사용자 등록
          socketManager.register(userResponse.user.id);
          
          if (roomId) {
            // 채팅방 정보 가져오기
            const roomResponse = await api.chat.getRoom(roomId);
            if (roomResponse.success && roomResponse.data) {
              setRoomData(roomResponse.data);
            }

            // 채팅방 참여
            socketManager.joinChatRoom(roomId);
            
            // 메시지 목록 가져오기
            const messagesResponse = await api.chat.getMessages(roomId);
            if (messagesResponse.success && messagesResponse.data) {
              const messagesWithIsMe = messagesResponse.data.messages.map((msg: Message) => ({
                ...msg,
                isMe: msg.sender._id === userResponse.user.id
              }));
              setMessages(messagesWithIsMe);
            }
          }
        }
      } catch (error) {
        console.error('채팅 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();

    // 컴포넌트 언마운트 시 채팅방 나가기
    return () => {
      if (roomId) {
        socketManager.leaveChatRoom(roomId);
      }
    };
  }, [roomId]);

  // Socket.IO 이벤트 리스너 설정
  useEffect(() => {
    if (!currentUser) return;

    const handleNewMessage = (messageData: Message) => {
      const messageWithIsMe = {
        ...messageData,
        isMe: messageData.sender._id === currentUser.id
      };
      
      // 중복 메시지 방지 - 이미 존재하는 메시지인지 확인
      setMessages(prev => {
        const exists = prev.some(msg => msg._id === messageWithIsMe._id);
        if (exists) {
          return prev; // 이미 존재하면 추가하지 않음
        }
        return [...prev, messageWithIsMe];
      });
    };

    socketManager.on('newMessage', handleNewMessage);

    return () => {
      socketManager.off('newMessage', handleNewMessage);
    };
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !roomId) return;

    try {
      const messageData = {
        type: "text",
        content: newMessage.trim(),
      };

      // API를 통해 메시지 전송 (Socket.IO로도 실시간 전송됨)
      await api.chat.sendMessage(roomId, messageData);
      setNewMessage("");
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;

    try {
      // 채팅방에서 나가기 (채팅 내역은 보존됨)
      await api.chat.leaveRoom(roomId);
      setLeaveDialogOpen(false);
      setMenuAnchorEl(null);
      
      // Socket에서도 채팅방 나가기
      socketManager.leaveChatRoom(roomId);
      
      navigate('/chat');
    } catch (error) {
      console.error('채팅방 나가기 실패:', error);
    }
  };

  // 이미지 업로드 서비스
  const uploadImageToService = async (file: File): Promise<string> => {
    // API 키가 없는 경우 base64 사용
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImageShare = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && roomId) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImageToService(file);
        
        const messageData = {
          type: "file",
          content: "이미지를 공유했습니다",
          fileUrl: uploadedUrl,
          fileName: file.name,
          fileSize: file.size,
        };

        await api.chat.sendMessage(roomId, messageData);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
      } finally {
        setIsUploading(false);
      }
    }
    setPlusMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUrlSubmit = async () => {
    if (imageUrl.trim() && roomId) {
      const messageData = {
        type: "file",
        content: "이미지를 공유했습니다",
        fileUrl: imageUrl.trim(),
        fileName: "shared_image.jpg",
      };

      try {
        await api.chat.sendMessage(roomId, messageData);
        setImageUrl("");
        setImageUrlDialogOpen(false);
        setPlusMenuOpen(false);
      } catch (error) {
        console.error('이미지 공유 실패:', error);
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!roomId || !roomData) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Typography>채팅방을 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  const otherParticipant = roomData.participants.find(p => p._id !== currentUser?.id);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "white", color: "#333" }} elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ mr: 1, color: "#E762A9" }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {otherParticipant && (
            <Avatar 
              src={otherParticipant.profileImageUrl}
              sx={{ width: 32, height: 32, mr: 1 }}
            >
              {otherParticipant.nickname.charAt(0)}
            </Avatar>
          )}
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} color="#333">
              {otherParticipant?.nickname || "채팅방"}
            </Typography>
            {roomData.postId && (
              <Typography variant="caption" color="text.secondary">
                {roomData.postId.title}
              </Typography>
            )}
          </Box>
          
          <IconButton onClick={handleMenuOpen} sx={{ color: "#E762A9" }}>
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <ListItem
              key={message._id}
              sx={{
                display: "flex",
                justifyContent: message.isMe ? "flex-end" : "flex-start",
                mb: 1,
                px: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: message.isMe ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  maxWidth: "70%",
                  gap: 1,
                }}
              >
                {!message.isMe && (
                  <Avatar
                    src={message.sender.profileImageUrl}
                    sx={{ width: 32, height: 32 }}
                  >
                    {message.sender.nickname.charAt(0)}
                  </Avatar>
                )}
                <Box>
                  {!message.isMe && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, mb: 0.5, display: "block" }}
                    >
                      {message.sender.nickname}
                    </Typography>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: message.isMe ? "#E3F2FD" : "#F3E5F5",
                      color: "#333",
                      borderRadius: 2,
                      borderTopLeftRadius: message.isMe ? 2 : 0.5,
                      borderTopRightRadius: message.isMe ? 0.5 : 2,
                      border: message.isMe ? "1px solid #BBDEFB" : "1px solid #E1BEE7",
                    }}
                  >
                    {message.type === "text" && (
                      <Typography variant="body2">{message.content}</Typography>
                    )}
                    {(message.type === "image" || message.type === "file") && message.fileUrl && (
                      <Box>
                        <img
                          src={message.fileUrl}
                          alt="공유 이미지"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => window.open(message.fileUrl, '_blank')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.textContent = '이미지를 불러올 수 없습니다';
                            errorDiv.style.padding = '20px';
                            errorDiv.style.textAlign = 'center';
                            errorDiv.style.backgroundColor = '#f5f5f5';
                            errorDiv.style.borderRadius = '8px';
                            errorDiv.style.color = '#666';
                            target.parentElement?.appendChild(errorDiv);
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ mt: 1, display: "block", opacity: 0.8 }}
                        >
                          {message.content}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      ml: message.isMe ? 0 : 1,
                      mr: message.isMe ? 1 : 0,
                      mt: 0.5,
                      display: "block",
                      textAlign: message.isMe ? "right" : "left",
                    }}
                  >
                    {formatTime(message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ position: "relative" }}>
        {/* 플러스 메뉴 */}
        {plusMenuOpen && (
          <Box
            sx={{
              position: "absolute",
              bottom: "100%",
              left: 8,
              mb: 1,
              display: "flex",
              gap: 1,
              p: 1,
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: "1px solid #e0e0e0",
              animation: "slideUp 0.2s ease-out",
              "@keyframes slideUp": {
                from: {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{
                bgcolor: "#E762A9",
                color: "white",
                "&:hover": { bgcolor: "#D554A0" },
                "&:disabled": { bgcolor: "#ccc", color: "#666" },
                width: 48,
                height: 48,
              }}
            >
              {isUploading ? <CircularProgress size={24} sx={{ color: "white" }} /> : <ImageIcon />}
            </IconButton>
            <IconButton
              onClick={() => {
                setImageUrlDialogOpen(true);
                setPlusMenuOpen(false);
              }}
              sx={{
                bgcolor: "#2196F3",
                color: "white",
                "&:hover": { bgcolor: "#1976D2" },
                width: 48,
                height: 48,
              }}
            >
              <LinkIcon />
            </IconButton>
          </Box>
        )}

        <Paper
          elevation={3}
          sx={{
            p: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            borderRadius: 0,
          }}
        >
          <IconButton
            onClick={() => setPlusMenuOpen(!plusMenuOpen)}
            sx={{
              color: "#E762A9",
              transform: plusMenuOpen ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <AddIcon />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ""}
            sx={{
              bgcolor: "#E762A9",
              color: "white",
              "&:hover": {
                bgcolor: "#D554A0",
              },
              "&:disabled": {
                bgcolor: "grey.300",
                color: "grey.500",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Paper>

        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageShare}
        />
      </Box>

      {/* 메뉴 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: { sx: { borderRadius: 2 } },
        }}
      >
        <MenuItem
          onClick={() => {
            setLeaveDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: "#f44336" }}
        >
          <ExitToAppIcon sx={{ mr: 1, fontSize: 20 }} />
          채팅방 나가기
        </MenuItem>
        <MenuItem
          onClick={() => {
            setReportDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: "#ff9800" }}
        >
          <ReportIcon sx={{ mr: 1, fontSize: 20 }} />
          신고하기
        </MenuItem>
        <MenuItem
          onClick={() => {
            // TODO: 차단 기능 구현
            handleMenuClose();
            console.log('사용자 차단');
          }}
          sx={{ color: "#f44336" }}
        >
          <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
          차단하기
        </MenuItem>
      </Menu>

      {/* 채팅방 나가기 확인 다이얼로그 */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>채팅방 나가기</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="#f44336" fontWeight={600} mb={2}>
            채팅방을 나가면 모든 대화 내역이 삭제됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 나와 상대방의 모든 대화 내용이 삭제됩니다<br/>
            • 삭제된 채팅 내역은 복구할 수 없습니다<br/>
            • 상대방과 다시 대화하려면 새로운 채팅을 시작해야 합니다<br/>
            • 모임이 종료되어도 채팅방에서 나가지 않으면 대화 내역은 보존됩니다
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setLeaveDialogOpen(false)}
            sx={{ color: "#666" }}
          >
            취소
          </Button>
          <Button
            onClick={handleLeaveRoom}
            variant="contained"
            sx={{
              bgcolor: "#f44336",
              "&:hover": { bgcolor: "#d32f2f" },
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 신고 다이얼로그 */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>사용자 신고</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            부적절한 행동을 신고하는 이유를 선택해주세요
          </Typography>
          <FormControl>
            <RadioGroup
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <FormControlLabel
                value="spam"
                control={
                  <Radio
                    sx={{
                      color: "#E762A9",
                      "&.Mui-checked": { color: "#E762A9" },
                    }}
                  />
                }
                label="스팸/광고성 메시지"
              />
              <FormControlLabel
                value="harassment"
                control={
                  <Radio
                    sx={{
                      color: "#E762A9",
                      "&.Mui-checked": { color: "#E762A9" },
                    }}
                  />
                }
                label="괴롭힘/욕설"
              />
              <FormControlLabel
                value="inappropriate"
                control={
                  <Radio
                    sx={{
                      color: "#E762A9",
                      "&.Mui-checked": { color: "#E762A9" },
                    }}
                  />
                }
                label="부적절한 내용"
              />
              <FormControlLabel
                value="other"
                control={
                  <Radio
                    sx={{
                      color: "#E762A9",
                      "&.Mui-checked": { color: "#E762A9" },
                    }}
                  />
                }
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
            sx={{ color: "#666" }}
          >
            취소
          </Button>
          <Button
            onClick={() => {
              // TODO: 신고 API 호출
              setReportDialogOpen(false);
              setReportReason("");
            }}
            disabled={!reportReason}
            variant="contained"
            sx={{
              bgcolor: "#ff9800",
              "&:hover": { bgcolor: "#f57c00" },
            }}
          >
            신고하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 이미지 URL 입력 다이얼로그 */}
      <Dialog
        open={imageUrlDialogOpen}
        onClose={() => {
          setImageUrlDialogOpen(false);
          setImageUrl("");
        }}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          이미지 링크 추가
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            공유할 이미지의 URL을 입력해주세요
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleImageUrlSubmit();
              }
            }}
            variant="outlined"
            sx={{ mt: 1 }}
          />
          {imageUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" mb={1} display="block">
                미리보기:
              </Typography>
              <img
                src={imageUrl}
                alt="미리보기"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setImageUrlDialogOpen(false);
              setImageUrl("");
            }}
            sx={{ color: '#666' }}
          >
            취소
          </Button>
          <Button
            onClick={handleImageUrlSubmit}
            disabled={!imageUrl.trim()}
            variant="contained"
            sx={{
              bgcolor: '#2196F3',
              '&:hover': { bgcolor: '#1976D2' }
            }}
          >
            공유하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}