import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Box, Button, TextField, Typography, Stack, createTheme, ThemeProvider } from "@mui/material";
import reactLogo from "../assets/react.svg"; // Import the react.svg

// Define a custom theme with the primary color
const theme = createTheme({
  palette: {
    primary: {
      main: "#E762A9", // Your primary color
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase transformation for buttons
        },
      },
    },
  },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleLogin = () => {
    login("dev-token"); // Replace with actual login logic
    const to = location?.state?.from?.pathname ?? "/";
    navigate(to, { replace: true });
  };

  const handleSignUpClick = () => {
    // Assuming a signup page exists or will be created at /signup
    navigate("/signup"); 
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center justify-center min-h-screen p-5 bg-white"> {/* Background color from image */}
        <Typography variant="h4" className="text-gray-700 font-bold mb-6">
          It People !
        </Typography>
        <Box className="flex items-center mb-14">
          <img src={reactLogo} className="w-24 h-24" alt="잇플 로고" />
          <Typography variant="h2" className="font-bold ml-4" style={{ color: theme.palette.primary.main }}>
            잇플
          </Typography>
        </Box>

        <Stack spacing={2} className="w-full max-w-sm p-6 bg-white rounded-lg" sx={{ boxShadow: 6, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
            sx={{ '& .MuiOutlinedInput-root': { fieldset: { borderColor: 'rgba(0, 0, 0, 0.23)' } } }}
          />
          <TextField
            label="비밀번호"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            sx={{ '& .MuiOutlinedInput-root': { fieldset: { borderColor: 'rgba(0, 0, 0, 0.23)' } } }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            className="py-3 text-lg"
            sx={{ boxShadow: 3 }}
          >
            로그인
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleSignUpClick}
            className="py-3 text-lg"
            sx={{ boxShadow: 3 }}
          >
            회원가입
          </Button>
        </Stack>

        <Button
          variant="text"
          className="text-blue-600 mb-5"
          onClick={() => navigate('/find-credentials')}
        >
          이메일 / 비밀번호 찾기
        </Button>

        <Stack spacing={2} className="w-full max-w-sm">
          <Button
            variant="contained"
            className="bg-[#FFEB00] text-[#3C1E1E] hover:bg-[#FFEB00] py-3 text-lg"
            onClick={() => alert("카카오톡 로그인")}
          >
            카카오톡 로그인
          </Button>
          <Button
            variant="contained"
            className="bg-[#03C75A] text-white hover:bg-[#03C75A] py-3 text-lg"
            onClick={() => alert("네이버 로그인")}
          >
            네이버 로그인
          </Button>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}


