import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, Collapse, List, ListItem, ListItemText } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

const myPostsData = [
  { id: 1, title: '첫 번째 게시글 제목', date: '2023-01-15', participants: 5 },
  { id: 2, title: '두 번째 게시글 제목', date: '2023-02-20', participants: 12 },
  { id: 3, title: '세 번째 게시글 제목', date: '2023-03-10', participants: 8 },
];

const blockedUsersData = [
  { id: 1, name: '차단 사용자 1' },
  { id: 2, name: '차단 사용자 2' },
];

const MyActivity: React.FC = () => {
  const navigate = useNavigate();
  const [openMyPosts, setOpenMyPosts] = useState(false);
  const [openParticipatedItple, setOpenParticipatedItple] = useState(false);
  const [openBlockedUsers, setOpenBlockedUsers] = useState(false);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center min-h-screen bg-white w-full">
        {/* Header */}
        <Box className="w-full flex items-center justify-between p-4 bg-primary" sx={{ backgroundColor: theme.palette.primary.main }}>
          <IconButton onClick={handleBack} className="text-white">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="text-white font-bold flex-grow text-center">
            내활동
          </Typography>
          <Box sx={{ width: 48 }} /> {/* Spacer for alignment */}
        </Box>

        <Stack spacing={2} className="w-full max-w-md px-6 py-8">
          {/* 내가 쓴 게시글 */}
          <Button
            variant="outlined"
            fullWidth
            className="py-3 text-lg justify-between"
            onClick={() => setOpenMyPosts(!openMyPosts)}
            endIcon={openMyPosts ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          >
            <Typography variant="inherit" className="text-left flex-grow">내가 쓴 게시글</Typography>
          </Button>
          <Collapse in={openMyPosts} timeout="auto" unmountOnExit>
            <List component="div" disablePadding className="bg-gray-50 rounded-md shadow-inner">
              {myPostsData.map((post) => (
                <ListItem key={post.id} className="border-b border-gray-200 last:border-b-0">
                  <ListItemText
                    primary={<Typography variant="body1" className="font-semibold">제목: {post.title}</Typography>}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          일자: {post.date}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.primary">
                          인원: {post.participants}명
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
            variant="outlined"
            fullWidth
            className="py-3 text-lg justify-between"
            onClick={() => setOpenParticipatedItple(!openParticipatedItple)}
            endIcon={openParticipatedItple ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          >
            <Typography variant="inherit" className="text-left flex-grow">참여한 잇플</Typography>
          </Button>
          <Collapse in={openParticipatedItple} timeout="auto" unmountOnExit>
            <Box className="p-4 bg-gray-50 rounded-md shadow-inner text-gray-600">
              <Typography variant="body2">참여한 잇플 목록은 추후 '참여하기' 탭에서 구현될 예정입니다.</Typography>
            </Box>
          </Collapse>

          {/* 차단 사용자 목록 */}
          <Button
            variant="outlined"
            fullWidth
            className="py-3 text-lg justify-between"
            onClick={() => setOpenBlockedUsers(!openBlockedUsers)}
            endIcon={openBlockedUsers ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          >
            <Typography variant="inherit" className="text-left flex-grow">차단 사용자 목록</Typography>
          </Button>
          <Collapse in={openBlockedUsers} timeout="auto" unmountOnExit>
            <List component="div" disablePadding className="bg-gray-50 rounded-md shadow-inner">
              {blockedUsersData.map((user) => (
                <ListItem key={user.id} className="border-b border-gray-200 last:border-b-0">
                  <ListItemText primary={<Typography variant="body1" className="font-semibold">{user.name}</Typography>} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default MyActivity;
