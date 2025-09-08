import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; // Import useAuth
import AreaSelectionModal from '../../components/AreaSelectionModal';

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth(); // Use the useAuth hook
  const [showAreaSelectionModal, setShowAreaSelectionModal] = useState(false);
  const [selectedAutonomousDistrict, setSelectedAutonomousDistrict] = useState<string | null>(null);
  const [selectedGeneralDistrict, setSelectedGeneralDistrict] = useState<string | null>(null);

  const handleLogout = () => {
    if (isAuthenticated) {
      logout(); // Call the logout function from AuthContext
      navigate('/login'); // Redirect to login page after logout
    } else {
      navigate('/login'); // Redirect to login page if not authenticated
    }
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          계정 관리
        </Typography>
      </Box>
      <Box p={2}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => setShowAreaSelectionModal(true)}
          sx={{ 
            mt: 2, 
            mb: 2,
            backgroundColor: '#E762A9',
            color: 'white',
            py: 2,
            fontSize: '1.25rem',
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: '#d54d96',
              boxShadow: 4,
            },
          }}
        >
          활동 지역 설정
        </Button>
        {selectedAutonomousDistrict && selectedGeneralDistrict && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            선택된 지역: {selectedAutonomousDistrict} {selectedGeneralDistrict}
          </Typography>
        )}
        <Stack spacing={3} mt={2}>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => navigate('/my/personal-info-edit')}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
            }}
          >
            개인 정보 수정
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => navigate('/my/location-permission-settings')}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
            }}
          >
            위치 권한 설정
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => navigate('/my/notification-settings')}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
            }}
          >
            알림 설정
          </Button>
          {isAuthenticated && (
            <Button 
              variant="contained" 
              fullWidth 
              className="py-4 text-xl font-semibold" 
              onClick={handleLogout}
              sx={{
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: '#b91c1c',
                  boxShadow: 4,
                },
              }}
            >
              로그아웃
            </Button>
          )}
          {!isAuthenticated && (
            <Button 
              variant="contained" 
              fullWidth 
              className="py-4 text-xl font-semibold" 
              onClick={() => navigate('/login')}
              sx={{
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: '#b91c1c',
                  boxShadow: 4,
                },
              }}
            >
              로그아웃
            </Button>
          )}
        </Stack>
      </Box>
      <AreaSelectionModal
        open={showAreaSelectionModal}
        onClose={() => setShowAreaSelectionModal(false)}
        onSelectArea={(district, generalDistrict) => {
          setSelectedAutonomousDistrict(district);
          setSelectedGeneralDistrict(generalDistrict);
          setShowAreaSelectionModal(false);
        }}
      />
    </Box>
  );
};

export default AccountManagement;
