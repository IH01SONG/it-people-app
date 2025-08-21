import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700} color="primary">
          로그인
        </Typography>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
        <Button
          variant="contained"
          onClick={() => {
            login("dev-token");
            const to = location?.state?.from?.pathname ?? "/";
            navigate(to, { replace: true });
          }}
        >
          로그인
        </Button>
      </Stack>
    </Box>
  );
}


