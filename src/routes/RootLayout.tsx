import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import BottomTabs from "../components/BottomTabs";

export default function RootLayout() {
  return (
    <>
      <Container maxWidth="sm" sx={{ px: 0, pb: 8, minHeight: "100dvh" }}>
        <Outlet />
        <div className="h-16" />
      </Container>
      <BottomTabs />
    </>
  );
}


