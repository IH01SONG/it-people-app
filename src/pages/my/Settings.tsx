import { Box, Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../../auth/AuthContext";

export default function Settings() {
  const { logout } = useAuth();
  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={700}>
          설정
        </Typography>
        <Button variant="outlined" color="primary" onClick={logout}>
          로그아웃
        </Button>
      </Stack>
    </Box>
  );
}
