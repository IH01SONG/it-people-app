import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
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
          height: {
            xs: "72px", // 모바일
            sm: "64px", // 태블릿/웹
          },
          backgroundColor: "#ffffff",
          borderTop: "1px solid #f0f0f0",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: {
            xs: "60px", // 모바일
            sm: "50px", // 웹
          },
          padding: {
            xs: "8px 4px 6px 4px", // 모바일
            sm: "6px 2px 4px 2px", // 웹
          },
          "&.Mui-selected": {
            color: "#E762A9",
            "& .MuiBottomNavigationAction-label": {
              fontSize: {
                xs: "11px", // 모바일
                sm: "10px", // 웹
              },
              fontWeight: 600,
              marginTop: "2px",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: {
              xs: "10px", // 모바일
              sm: "9px", // 웹
            },
            fontWeight: 400,
            marginTop: "2px",
            lineHeight: 1.2,
          },
          "& .MuiSvgIcon-root": {
            fontSize: {
              xs: "24px", // 모바일
              sm: "22px", // 웹
            },
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
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          pb: "env(safe-area-inset-bottom)",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #f0f0f0",
          // 웹에서는 Container 너비에 맞춤
          maxWidth: { xs: "100%", sm: "600px" }, // sm 브레이크포인트에서 Container maxWidth와 동일
          left: { xs: 0, sm: "50%" },
          transform: { xs: "none", sm: "translateX(-50%)" },
        }}
      >
        <BottomNavigation
          value={currentIndex}
          onChange={(_, newValue: number) => {
            navigate(routes[newValue]);
          }}
          showLabels
          sx={{
            height: {
              xs: "72px", // 모바일
              sm: "64px", // 웹
            },
            "& .MuiBottomNavigationAction-root": {
              minWidth: {
                xs: "60px", // 모바일
                sm: "50px", // 웹
              },
              padding: {
                xs: "8px 4px 6px 4px", // 모바일
                sm: "6px 2px 4px 2px", // 웹
              },
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
      </Paper>
    </ThemeProvider>
  );
}
