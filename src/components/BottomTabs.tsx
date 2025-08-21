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

const routes = ["/", "/map", "/new", "/chat", "/my"] as const;

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
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <BottomNavigation
        value={currentIndex}
        onChange={(_, newValue: number) => {
          navigate(routes[newValue]);
        }}
        showLabels
      >
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="지도" icon={<MapIcon />} />
        <BottomNavigationAction label="새글추가" icon={<AddCircleIcon />} />
        <BottomNavigationAction label="채팅" icon={<ChatBubbleIcon />} />
        <BottomNavigationAction label="MY" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
