import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, Collapse, List, ListItem, ListItemText, CircularProgress, Avatar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { useBlockUser } from '../../contexts/BlockUserContext';

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


const MyActivity: React.FC = () => {
  const navigate = useNavigate();
  const [openMyItple, setOpenMyItple] = useState(false);
  const [openParticipatedItple, setOpenParticipatedItple] = useState(false);
  const [openBlockedUsers, setOpenBlockedUsers] = useState(false);
  
  // BlockUserContext 사용
  const { blockedUsers, unblockUser, cleanInvalidUsers, isLoading } = useBlockUser();
  
  // 디버깅을 위한 로그
  console.log('🔍 MyActivity blockedUsers:', blockedUsers);

  // 컴포넌트 마운트 시 유효하지 않은 사용자 제거
  useEffect(() => {
    if (blockedUsers.length > 0) {
      cleanInvalidUsers();
    }
  }, [blockedUsers.length, cleanInvalidUsers]);

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
