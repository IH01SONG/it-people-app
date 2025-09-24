import React, { useEffect, useState } from 'react';
import { Alert, Snackbar, Button, Box } from '@mui/material';

interface NotificationData {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  data?: any;
  actions?: Array<{ text: string; action: () => void }>;
}

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<(NotificationData & { id: string })[]>([]);

  useEffect(() => {
    const handleSocketNotification = (event: CustomEvent<NotificationData>) => {
      const notification = {
        ...event.detail,
        id: Date.now().toString()
      };

      setNotifications(prev => [...prev, notification]);

      // 10초 후 자동 제거
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    // Socket.IO 알림 이벤트 리스너 등록
    window.addEventListener('socket-notification', handleSocketNotification as EventListener);

    return () => {
      window.removeEventListener('socket-notification', handleSocketNotification as EventListener);
    };
  }, []);

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getSeverity = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <Box>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            mt: index * 8,
            zIndex: 9999
          }}
          onClose={() => handleClose(notification.id)}
        >
          <Alert
            severity={getSeverity(notification.type)}
            onClose={() => handleClose(notification.id)}
            sx={{
              minWidth: 300,
              maxWidth: 400,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {notification.title}
              </Box>
              <Box sx={{ mb: notification.actions ? 1 : 0 }}>
                {notification.message}
              </Box>
              {notification.actions && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {notification.actions.map((action, actionIndex) => (
                    <Button
                      key={`action-${notification.id}-${actionIndex}`}
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        action.action();
                        handleClose(notification.id);
                      }}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.25,
                        px: 1,
                        minHeight: 'auto',
                        borderColor: 'currentColor',
                        '&:hover': {
                          borderColor: 'currentColor',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      {action.text}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}