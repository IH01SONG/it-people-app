import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/AuthContext";
import DevAuthProvider from "./auth/DevAuthProvider";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DevAuthProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DevAuthProvider>
    </ThemeProvider>
  );
}

export default App;
