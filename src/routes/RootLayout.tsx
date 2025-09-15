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
          pb: { xs: 9, sm: 8 }, // BottomTabs와 동일한 높이 간격
          minHeight: "100dvh",
          width: "100%",
          maxWidth: { xs: "100%", sm: "600px" }, // Container 너비 제한
          margin: "0 auto", // 중앙 정렬
        }}
      >
        <Outlet />
        {/* BottomTabs 공간 확보 */}
        <Box 
          sx={{ 
            height: { xs: "80px", sm: "72px" } // BottomTabs 높이와 일치
          }}
        />
      </Container>
      
      {/* BottomTabs는 Container와 동일한 너비 제한 */}
      <BottomTabs />
    </>
  );
}


