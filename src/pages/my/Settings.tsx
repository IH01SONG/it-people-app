import { Box, Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={700}>
          설정
        </Typography>
        {isAuthenticated && (
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            로그아웃
          </Button>
        )}
        {!isAuthenticated && (
          <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
            로그인
          </Button>
        )}
      </Stack>
    </Box>
  );
}
