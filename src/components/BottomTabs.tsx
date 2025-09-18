import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PersonIcon from "@mui/icons-material/Person";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const routes = ["/", "/map", "/new", "/chat", "/my"] as const;

// 반응형 테마 - 모바일과 웹 환경 구분
const responsiveTheme = createTheme({
  palette: {
    primary: {
      main: "#E762A9",
    },
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          // 모바일에서는 72px, 웹에서는 64px
          height: "72px", // 모바일 기본값
          backgroundColor: "#ffffff",
          borderTop: "1px solid #f0f0f0",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: "60px", // 모바일 기본값
          padding: "8px 4px 6px 4px", // 모바일 기본값
            "&.Mui-selected": {
              color: "#E762A9",
              "& .MuiBottomNavigationAction-label": {
                fontSize: "11px", // 모바일 기본값
                fontWeight: 600,
                marginTop: "2px",
              },
            },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "10px", // 모바일 기본값
            fontWeight: 400,
            marginTop: "2px",
            lineHeight: 1.2,
          },
          "& .MuiSvgIcon-root": {
            fontSize: "24px", // 모바일 기본값
            marginBottom: "2px",
          },
        },
      },
    },
  },
});

export default function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = Math.max(
    0,
    routes.findIndex((r) =>
      r === "/" ? location.pathname === "/" : location.pathname.startsWith(r)
    )
  );

  useEffect(() => {
    // Scroll to top on route change for better mobile UX
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <ThemeProvider theme={responsiveTheme}>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center", // 중앙 정렬
        }}
      >
        <Box
          sx={{
            pb: "env(safe-area-inset-bottom)", // 노치 영역 대응
            backgroundColor: "#ffffff",
            borderTop: "1px solid #f0f0f0",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
            // Step2와 완전히 동일한 너비 설정
            width: "100%",
            maxWidth: "600px", // Step2와 동일
          }}
        >
        <BottomNavigation
          value={currentIndex}
          onChange={(_, newValue: number) => {
            navigate(routes[newValue]);
          }}
          showLabels
          sx={{
          height: "72px", // 모바일 기본값
            "& .MuiBottomNavigationAction-root": {
              minWidth: "60px", // 모바일 기본값
              padding: "8px 4px 6px 4px", // 모바일 기본값
            },
          }}
        >
          <BottomNavigationAction 
            label="홈" 
            icon={<HomeIcon />}
            sx={{
              "&.Mui-selected": {
                color: "#E762A9",
              },
            }}
          />
          <BottomNavigationAction 
            label="지도" 
            icon={<MapIcon />}
            sx={{
              "&.Mui-selected": {
                color: "#E762A9",
              },
            }}
          />
          <BottomNavigationAction 
            label="새글추가" 
            icon={<AddCircleIcon />}
            sx={{
              "&.Mui-selected": {
                color: "#E762A9",
              },
            }}
          />
          <BottomNavigationAction 
            label="채팅" 
            icon={<ChatBubbleIcon />}
            sx={{
              "&.Mui-selected": {
                color: "#E762A9",
              },
            }}
          />
          <BottomNavigationAction 
            label="MY" 
            icon={<PersonIcon />}
            sx={{
              "&.Mui-selected": {
                color: "#E762A9",
              },
            }}
          />
        </BottomNavigation>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
