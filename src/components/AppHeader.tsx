import { Box, Typography, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import logoSvg from "../assets/logo.png";

// 반응형 테마 - BottomTabs와 동일한 패턴
const responsiveTheme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f0f0f0",
        },
      },
    },
  },
});

/**
 * 앱 헤더 컴포넌트
 * 로고와 앱 이름을 표시하는 상단 헤더
 * Step2 페이지 헤더와 동일한 너비 비율 적용
 */
export default function AppHeader() {
  return (
    <ThemeProvider theme={responsiveTheme}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          pt: "env(safe-area-inset-top)", // 노치 영역 대응
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          // Step2와 완전히 동일한 너비 설정
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 2, sm: 1.5 }, // 모바일: 16px, 웹: 12px
            px: { xs: 2, sm: 1.5 }, // 모바일: 16px, 웹: 12px
            height: { xs: "64px", sm: "56px" }, // 모바일: 64px, 웹: 56px
            width: "100%",
          }}
        >
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: { xs: 1.5, sm: 1 } // 모바일: 12px, 웹: 8px
            }}
          >
            {/* 로고 이미지 - 반응형 크기 */}
            <Box
              component="img"
              src={logoSvg}
              alt="잇플 로고"
              sx={{
                width: { xs: "28px", sm: "24px" }, // 모바일: 28px, 웹: 24px
                height: { xs: "28px", sm: "24px" },
                objectFit: "contain",
              }}
            />
            
            {/* 앱 이름 - 반응형 크기 */}
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 800,
                color: "#2E2E2E",
                fontSize: { xs: "1.5rem", sm: "1.375rem" }, // 모바일: 24px, 웹: 22px
                letterSpacing: "-0.02em",
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                lineHeight: 1.2,
              }}
            >
              잇플
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
