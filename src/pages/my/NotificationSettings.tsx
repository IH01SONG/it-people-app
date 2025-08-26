import React, { useState } from 'react';
import { Box, Typography, IconButton, Stack, Switch, FormControlLabel, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState(true);
  const [postNotifications, setPostNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);

  const handleToggleAllNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setAllNotifications(isChecked);
    setPostNotifications(isChecked);
    setChatNotifications(isChecked);
    setEventNotifications(isChecked);
    alert(`모든 알림이 ${isChecked ? '활성화' : '비활성화'}되었습니다.`);
  };

  const handleTogglePostNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostNotifications(event.target.checked);
    if (!event.target.checked) setAllNotifications(false);
    alert(`게시글 알림이 ${event.target.checked ? '활성화' : '비활성화'}되었습니다.`);
  };

  const handleToggleChatNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatNotifications(event.target.checked);
    if (!event.target.checked) setAllNotifications(false);
    alert(`채팅 알림이 ${event.target.checked ? '활성화' : '비활성화'}되었습니다.`);
  };

  const handleToggleEventNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEventNotifications(event.target.checked);
    if (!event.target.checked) setAllNotifications(false);
    alert(`이벤트 알림이 ${event.target.checked ? '활성화' : '비활성화'}되었습니다.`);
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          알림 설정
        </Typography>
      </Box>
      <Box p={2}>
        <Stack spacing={2} mt={3}>
          <FormControlLabel
            control={<Switch checked={allNotifications} onChange={handleToggleAllNotifications} />}
            label={<Typography variant="h6">모든 알림</Typography>}
            labelPlacement="start"
            sx={{ justifyContent: 'space-between', margin: 0 }}
          />
          <Divider />
          <FormControlLabel
            control={<Switch checked={postNotifications} onChange={handleTogglePostNotifications} disabled={!allNotifications} />}
            label={<Typography variant="body1">게시글 알림</Typography>}
            labelPlacement="start"
            sx={{ justifyContent: 'space-between', margin: 0, ml: 2 }}
          />
          <FormControlLabel
            control={<Switch checked={chatNotifications} onChange={handleToggleChatNotifications} disabled={!allNotifications} />}
            label={<Typography variant="body1">채팅 알림</Typography>}
            labelPlacement="start"
            sx={{ justifyContent: 'space-between', margin: 0, ml: 2 }}
          />
          <FormControlLabel
            control={<Switch checked={eventNotifications} onChange={handleToggleEventNotifications} disabled={!allNotifications} />}
            label={<Typography variant="body1">이벤트 및 공지 알림</Typography>}
            labelPlacement="start"
            sx={{ justifyContent: 'space-between', margin: 0, ml: 2 }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
