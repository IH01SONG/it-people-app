import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, Collapse, List, ListItem, ListItemText, CircularProgress, Avatar, Chip, Tooltip } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import { getCategoryName } from '../../utils/hardcodedCategories';
import GroupIcon from '@mui/icons-material/Group';
import CancelIcon from '@mui/icons-material/Cancel';
import { useBlockUser } from '../../contexts/BlockUserContext';
import { useMyActivities } from '../../hooks/useMyActivities';
import { api } from '../../lib/api';

const theme = createTheme({
  palette: {
    primary: {
      main: "#E762A9",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const MyActivity: React.FC = () => {
  const navigate = useNavigate();
  const [openMyItple, setOpenMyItple] = useState(false);
  const [openParticipatedItple, setOpenParticipatedItple] = useState(false);
  const [openBlockedUsers, setOpenBlockedUsers] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  
  // BlockUserContext 사용
  const { blockedUsers, unblockUser, cleanInvalidUsers, isLoading } = useBlockUser();
  
  // 내 활동 데이터 관리
  const { myActivities, activitiesLoading, loadMyActivities, removeActivity, handleCancelParticipation } = useMyActivities();
  
  // 디버깅을 위한 로그
  console.log('🔍 MyActivity blockedUsers:', blockedUsers);

  // 컴포넌트 마운트 시 유효하지 않은 사용자 제거 및 내 활동 로드
  useEffect(() => {
    if (blockedUsers.length > 0) {
      cleanInvalidUsers();
    }
    loadMyActivities();
  }, [blockedUsers.length, cleanInvalidUsers, loadMyActivities]);

  // 참여신청/취소 성공 시 내 활동 목록 자동 새로고침
  useEffect(() => {
    const handleJoinRequestSuccess = (event: CustomEvent) => {
      console.log('🔄 참여신청/취소 성공, 내 활동 목록 새로고침:', event.detail);
      loadMyActivities();
    };

    window.addEventListener('joinRequestSuccess', handleJoinRequestSuccess as EventListener);

    return () => {
      window.removeEventListener('joinRequestSuccess', handleJoinRequestSuccess as EventListener);
    };
  }, [loadMyActivities]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleEditItple = (id: string) => {
    // 게시글 수정 페이지로 이동
    console.log('✏️ 게시글 수정 페이지로 이동:', id);
    navigate(`/edit/${id}`);
  };

  const handleDeleteItple = async (id: string) => {
    // 이중 확인으로 실수 방지
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?\n\n삭제된 게시글은 복구할 수 없습니다.')) {
      return;
    }

    // 최종 확인
    if (!window.confirm('마지막 확인입니다.\n정말로 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeletingPostId(id); // 삭제 중 상태 설정
      console.log('🗑️ 게시글 삭제 시작:', id);
      
      // API 호출
      await api.posts.delete(id);
      console.log('✅ 게시글 삭제 성공');
      
      // 로컬 상태에서 제거
      removeActivity(id);
      
      // localStorage에 삭제된 게시글 ID 추가 (중복 로드 방지)
      const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
      if (!deletedPosts.includes(id)) {
        deletedPosts.push(id);
        localStorage.setItem('deletedPosts', JSON.stringify(deletedPosts));
      }
      
      alert('게시글이 성공적으로 삭제되었습니다.');
      
    } catch (error: any) {
      console.error('❌ 게시글 삭제 실패:', error);
      
      // 구체적인 오류 메시지 제공
      let errorMessage = '게시글 삭제에 실패했습니다.';
      
      if (error?.response?.status === 404) {
        errorMessage = '게시글을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.';
        // 404 오류인 경우 로컬에서도 제거
        removeActivity(id);
      } else if (error?.response?.status === 403) {
        errorMessage = '이 게시글을 삭제할 권한이 없습니다.';
      } else if (error?.response?.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return;
      } else if (error?.response?.data?.message) {
        errorMessage = `삭제 실패: ${error.response.data.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setDeletingPostId(null); // 삭제 중 상태 해제
    }
  };

  // 차단 해제 처리
  const handleUnblockUser = async (id: string, name: string) => {
    if (window.confirm(`${name} 사용자의 차단을 해제하시겠습니까?`)) {
      try {
        await unblockUser(id);
        alert(`${name} 사용자의 차단이 해제되었습니다.`);
      } catch (err) {
        console.error('차단 해제 실패:', err);
        alert('차단 해제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };



  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} color="inherit">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
            내활동
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', alignItems: 'center' }}>
          <Stack spacing={4} className="w-full px-6 py-8">
            {/* 내가 만든 잇플 */}
            <Button
              variant="contained"
              fullWidth
              className="py-5 text-2xl font-semibold justify-between"
              onClick={() => setOpenMyItple(!openMyItple)}
              endIcon={openMyItple ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
            >
              <Typography variant="inherit" className="text-left flex-grow text-white">내가 만든 잇플</Typography>
            </Button>
            <Collapse in={openMyItple} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className="bg-gray-50 rounded-md shadow-inner w-full">
                {activitiesLoading && (
                  <ListItem>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </ListItem>
                )}
                {!activitiesLoading && myActivities.filter(activity => activity.role === '주최자').length === 0 && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', py: 2 }}>
                      내가 만든 잇플이 없습니다.
                    </Typography>
                  </ListItem>
                )}
                {!activitiesLoading && myActivities
                  .filter(activity => activity.role === '주최자')
                  .map((activity) => (
                    <ListItem key={activity.id} className="border-b border-gray-200 last:border-b-0">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                          <Typography variant="body1" className="font-semibold">
                                {activity.title}
                          </Typography>
                              <Chip
                                label={getCategoryName(activity.category)}
                                size="small" 
                                sx={{ 
                                  backgroundColor: theme.palette.primary.light,
                                  color: 'white',
                                  fontSize: '0.75rem'
                                }} 
                              />
                            </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="게시글 수정" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleEditItple(activity.id)}
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.light,
                                  },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="게시글 삭제" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteItple(activity.id)}
                                disabled={deletingPostId === activity.id}
                                sx={{
                                  color: '#dc2626',
                                  '&:hover': {
                                    backgroundColor: '#fef2f2',
                                  },
                                  '&:disabled': {
                                    color: 'rgba(220, 38, 38, 0.5)',
                                  },
                                }}
                              >
                                {deletingPostId === activity.id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <DeleteIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                              모임일: {activity.time}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                              참여자: {activity.members}/{activity.maxMembers}명
                          </Typography>
                          <br />
                            <Typography component="span" variant="body2" color={activity.status === '모집 중' ? 'success.main' : 'text.secondary'}>
                              상태: {activity.status}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>

            {/* 참여한 잇플 */}
            <Button
              variant="contained"
              fullWidth
              className="py-5 text-2xl font-semibold justify-between"
              onClick={() => setOpenParticipatedItple(!openParticipatedItple)}
              endIcon={openParticipatedItple ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
            >
              <Typography variant="inherit" className="text-left flex-grow text-white">참여한 잇플</Typography>
            </Button>
            <Collapse in={openParticipatedItple} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className="bg-gray-50 rounded-md shadow-inner w-full">
                {activitiesLoading && (
                  <ListItem>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </ListItem>
                )}
                {!activitiesLoading && myActivities.filter(activity => activity.role === '참여자').length === 0 && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', py: 2 }}>
                      참여한 잇플이 없습니다.
                    </Typography>
                  </ListItem>
                )}
                {!activitiesLoading && myActivities
                  .filter(activity => activity.role === '참여자')
                  .map((activity) => (
                    <ListItem key={activity.id} className="border-b border-gray-200 last:border-b-0">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                              <Typography variant="body1" className="font-semibold">
                                {activity.title}
                              </Typography>
                              <Chip
                                label={getCategoryName(activity.category)}
                                size="small"
                                sx={{
                                  backgroundColor: theme.palette.primary.light,
                                  color: 'white',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleCancelParticipation(activity.id)}
                                sx={{
                                  color: '#dc2626',
                                  '&:hover': {
                                    backgroundColor: '#fef2f2',
                                  },
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
              </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              모임일: {activity.time}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.primary">
                              참여자: {activity.members}/{activity.maxMembers}명
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color={activity.status === '참여 중' ? 'success.main' : 'text.secondary'}>
                              상태: {activity.status}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Collapse>

            {/* 차단 사용자 목록 */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                fullWidth
                className="py-5 text-2xl font-semibold justify-between"
                onClick={() => setOpenBlockedUsers(!openBlockedUsers)}
                endIcon={openBlockedUsers ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: 4,
                  },
                }}
              >
                <Typography variant="inherit" className="text-left flex-grow text-white">차단 사용자 목록</Typography>
              </Button>
            </Box>
            <Collapse in={openBlockedUsers} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className="bg-gray-50 rounded-md shadow-inner w-full">
                {isLoading && (
                  <ListItem>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </ListItem>
                )}
                {!isLoading && blockedUsers.length === 0 && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', py: 2 }}>
                      차단된 사용자가 없습니다.
                    </Typography>
                  </ListItem>
                )}
                {!isLoading && blockedUsers.map((user) => (
                  <ListItem key={user.id} className="border-b border-gray-200 last:border-b-0">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {user.name ? user.name.charAt(0) : '?'}
                    </Avatar>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body1" className="font-semibold">
                              {user.name || '알 수 없는 사용자'}
                            </Typography>
                            {user.email && (
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleUnblockUser(user.id, user.name)}
                            disabled={isLoading}
                            sx={{
                              color: '#dc2626',
                              '&:hover': {
                                backgroundColor: '#fef2f2',
                              },
                              '&.Mui-disabled': {
                                color: 'rgba(0, 0, 0, 0.26)',
                              },
                            }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Stack>
        </Box>
      </Box>

    </ThemeProvider>
  );
};

export default MyActivity;
