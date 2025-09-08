import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, Collapse, List, ListItem, ListItemText, CircularProgress, Alert } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
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

const myItpleData = [
  { id: 1, title: '첫 번째 잇플 제목', date: '2023-01-15', participants: 5, isActive: true },
  { id: 2, title: '두 번째 잇플 제목', date: '2023-02-20', participants: 12, isActive: false },
  { id: 3, title: '세 번째 잇플 제목', date: '2023-03-10', participants: 8, isActive: true },
];

const blockedUsersData = [
  { id: 1, name: '차단 사용자 1' },
  { id: 2, name: '차단 사용자 2' },
];

const MyActivity: React.FC = () => {
  const navigate = useNavigate();
  const [openMyItple, setOpenMyItple] = useState(false);
  const [openParticipatedItple, setOpenParticipatedItple] = useState(false);
  const [openBlockedUsers, setOpenBlockedUsers] = useState(false);
  
  // 차단 사용자 목록을 state로 관리
  const [blockedUsers, setBlockedUsers] = useState<Array<{id: number, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleEditItple = (id: number) => {
    alert(`잇플 ${id} 수정하기`);
    // 실제로는 수정 페이지로 이동
  };

  const handleDeleteItple = (id: number) => {
    alert(`잇플 ${id} 삭제하기`);
    // 실제로는 삭제 확인 후 삭제 처리
  };

  // 차단 사용자 목록 로드
  const loadBlockedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getBlockedUsers();
      setBlockedUsers(response.data || []);
    } catch (err) {
      console.error('차단 사용자 목록 로드 실패:', err);
      setError('차단 사용자 목록을 불러오는데 실패했습니다.');
      // 개발 환경에서는 기본 데이터 사용
      setBlockedUsers(blockedUsersData);
    } finally {
      setLoading(false);
    }
  };

  // 차단 해제 처리
  const handleUnblockUser = async (id: number, name: string) => {
    if (window.confirm(`${name} 사용자의 차단을 해제하시겠습니까?`)) {
      setLoading(true);
      setError(null);
      try {
        await api.unblockUser(id);
        // 성공 시 목록에서 제거
        setBlockedUsers(prev => prev.filter(user => user.id !== id));
        alert(`${name} 사용자의 차단이 해제되었습니다.`);
      } catch (err) {
        console.error('차단 해제 실패:', err);
        setError('차단 해제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 컴포넌트 마운트 시 차단 사용자 목록 로드
  useEffect(() => {
    loadBlockedUsers();
  }, []);

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
                {myItpleData.map((itple) => (
                  <ListItem key={itple.id} className="border-b border-gray-200 last:border-b-0">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1" className="font-semibold">
                            제목: {itple.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditItple(itple.id)}
                              sx={{
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.light,
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItple(itple.id)}
                              disabled={itple.isActive}
                              sx={{
                                color: itple.isActive ? 'gray' : '#dc2626',
                                '&:hover': {
                                  backgroundColor: itple.isActive ? 'transparent' : '#fef2f2',
                                },
                                '&.Mui-disabled': {
                                  color: 'gray',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            일자: {itple.date}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            인원: {itple.participants}명
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color={itple.isActive ? 'success.main' : 'text.secondary'}>
                            상태: {itple.isActive ? '진행중' : '완료'}
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
              <Box className="p-4 bg-gray-50 rounded-md shadow-inner text-gray-600 w-full">
                <Typography variant="body2">참여한 잇플 목록은 추후 '참여하기' 탭에서 구현될 예정입니다.</Typography>
              </Box>
            </Collapse>

            {/* 차단 사용자 목록 */}
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
            <Collapse in={openBlockedUsers} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className="bg-gray-50 rounded-md shadow-inner w-full">
                {loading && (
                  <ListItem>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </ListItem>
                )}
                {error && (
                  <ListItem>
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {error}
                    </Alert>
                  </ListItem>
                )}
                {!loading && !error && blockedUsers.length === 0 && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', py: 2 }}>
                      차단된 사용자가 없습니다.
                    </Typography>
                  </ListItem>
                )}
                {!loading && blockedUsers.map((user) => (
                  <ListItem key={user.id} className="border-b border-gray-200 last:border-b-0">
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1" className="font-semibold">
                            {user.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleUnblockUser(user.id, user.name)}
                            disabled={loading}
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
