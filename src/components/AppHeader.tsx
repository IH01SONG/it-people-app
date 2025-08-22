import { Typography } from "@mui/material";
import logoSvg from "../assets/logo.svg";

export default function AppHeader() {
  return (
    <div className="flex items-center justify-center py-4 px-2 border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <img src={logoSvg} alt="잇플 로고" className="w-8 h-8" />
        <Typography variant="h6" fontWeight={700} color="#333">
          잇플
        </Typography>
      </div>
    </div>
  );
}