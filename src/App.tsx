import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/AuthContext";
import { BlockUserProvider } from "./contexts/BlockUserContext";
import NotificationToast from "./components/NotificationToast";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BlockUserProvider>
          <AppRoutes />
          <NotificationToast />
        </BlockUserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
