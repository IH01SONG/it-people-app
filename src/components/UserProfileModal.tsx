import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import { useBlockUser } from '../contexts/BlockUserContext';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserBlock?: (userId: string, userName: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  open, 
  onClose, 
  user, 
  onUserBlock 
}) => {
  const { isUserBlocked, unblockUser } = useBlockUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const isBlocked = isUserBlocked(user.id);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBlockUser = async () => {
    if (window.confirm(`${user.name} 사용자를 차단하시겠습니까?`)) {
      setIsBlocking(true);
      setError(null);
      try {
        // 상위 컴포넌트에서 차단 처리하도록 콜백만 호출
        onUserBlock?.(user.id, user.name);
        handleMenuClose();
        onClose();
        alert(`${user.name} 사용자가 차단되었습니다.`);
      } catch (err) {
        setError('사용자 차단에 실패했습니다.');
      } finally {
        setIsBlocking(false);
      }
    }
  };

  const handleUnblockUser = async () => {
    if (window.confirm(`${user.name} 사용자의 차단을 해제하시겠습니까?`)) {
      setIsBlocking(true);
      setError(null);
      try {
        await unblockUser(user.id);
        handleMenuClose();
        onClose();
        alert(`${user.name} 사용자의 차단이 해제되었습니다.`);
      } catch (err) {
        setError('차단 해제에 실패했습니다.');
      } finally {
        setIsBlocking(false);
      }
    }
  };

  const handleClose = () => {
    setError(null);
    setAnchorEl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">사용자 정보</Typography>
          <IconButton onClick={handleMenuClick} disabled={isBlocking}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Avatar
            src={user.avatar}
            sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}
          >
            {user.name.charAt(0)}
          </Avatar>
          
          <Typography variant="h5" fontWeight={600} mb={1}>
            {user.name}
          </Typography>
          
          {user.email && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {user.email}
            </Typography>
          )}

          {isBlocked && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              color: 'error.main',
              bgcolor: 'error.light',
              px: 2,
              py: 1,
              borderRadius: 2
            }}>
              <BlockIcon fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                차단된 사용자
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          닫기
        </Button>
      </DialogActions>

      {/* 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {isBlocked ? (
          <MenuItem onClick={handleUnblockUser} disabled={isBlocking}>
            <ListItemIcon>
              <PersonIcon color="success" />
            </ListItemIcon>
            <ListItemText>차단 해제</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleBlockUser} disabled={isBlocking}>
            <ListItemIcon>
              <BlockIcon color="error" />
            </ListItemIcon>
            <ListItemText>사용자 차단</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Dialog>
  );
};

export default UserProfileModal;
