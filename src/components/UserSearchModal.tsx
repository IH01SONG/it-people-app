import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
}

interface UserSearchModalProps {
  open: boolean;
  onClose: () => void;
  onUserBlock: (userId: string, userName: string) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ open, onClose, onUserBlock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // TODO: 실제 사용자 검색 API 호출
      // const response = await api.searchUsers(searchQuery);
      // setSearchResults(response.data);
      
      // 임시 목 데이터
      const mockUsers: User[] = [
        { id: '1', name: '김철수', email: 'kim@example.com' },
        { id: '2', name: '이영희', email: 'lee@example.com' },
        { id: '3', name: '박민수', email: 'park@example.com' },
      ].filter(user => 
        user.name.includes(searchQuery) || user.email.includes(searchQuery)
      );
      
      setSearchResults(mockUsers);
    } catch (err) {
      console.error('사용자 검색 실패:', err);
      setError('사용자 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 차단 처리
  const handleBlockUser = async (user: User) => {
    if (window.confirm(`${user.name} 사용자를 차단하시겠습니까?`)) {
      try {
        await api.blockUser(user.id);
        onUserBlock(user.id, user.name);
        onClose();
        alert(`${user.name} 사용자가 차단되었습니다.`);
      } catch (err) {
        console.error('사용자 차단 실패:', err);
        alert('사용자 차단에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BlockIcon color="error" />
          <Typography variant="h6">사용자 차단</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <TextField
          fullWidth
          label="사용자 검색"
          placeholder="이름 또는 이메일로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {searchResults.length > 0 && (
          <List>
            {searchResults.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton onClick={() => handleBlockUser(user)}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {user.name ? user.name.charAt(0) : '?'}
                  </Avatar>
                  <ListItemText
                    primary={user.name || '알 수 없는 사용자'}
                    secondary={user.email || ''}
                  />
                  <BlockIcon color="error" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {searchQuery && searchResults.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              검색 결과가 없습니다.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSearchModal;
