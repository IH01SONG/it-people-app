import { Container, Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import BottomTabs from "../components/BottomTabs";

export default function RootLayout() {
  return (
    <>
      <Container 
        maxWidth="sm" 
        sx={{ 
          px: 0, 
          pb: { xs: 9, sm: 8 }, // 모바일: 9, 웹: 8
          minHeight: "100dvh" 
        }}
      >
        <Outlet />
        <Box 
          sx={{ 
            height: { xs: "80px", sm: "72px" } // 모바일: 80px, 웹: 72px
          }}
        />
      </Container>
      <BottomTabs />
    </>
  );
}


