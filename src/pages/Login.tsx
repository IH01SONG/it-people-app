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
    alert("회원가입 페이지로 이동합니다."); // Placeholder for navigation to signup
    // navigate("/signup"); 
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center justify-center min-h-screen p-5 bg-white"> {/* Background color from image */}
        <img src={reactLogo} className="w-24 h-24 mb-10" alt="잇플 로고" /> {/* Replaced Typography with img */}

        <Stack spacing={2} className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md mb-5">
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
          />
          <TextField
            label="비밀번호"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            className="py-3 text-lg"
          >
            로그인
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleSignUpClick}
            className="py-3 text-lg"
          >
            회원가입
          </Button>
        </Stack>

        <Button
          variant="text"
          className="text-blue-600 mb-5"
          onClick={() => alert("아이디/비밀번호 찾기 페이지")}
        >
          아이디 / 비밀번호 찾기
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


