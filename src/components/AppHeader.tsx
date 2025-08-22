import { Typography } from "@mui/material";
import logoSvg from "../assets/logo.png";

/**
 * 앱 헤더 컴포넌트
 * 로고와 앱 이름을 표시하는 상단 헤더
 */
export default function AppHeader() {
  return (
    <div className="flex items-center justify-center py-3 px-4 border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        {/* 로고 이미지 - 작은 사이즈로 조정 */}
        <img 
          src={logoSvg} 
          alt="잇플 로고" 
          className="w-6 h-6 object-contain" 
        />
        
        {/* 앱 이름 - 로고와 조화로운 스타일링 */}
        <Typography 
          variant="h5" 
          sx={{
            fontWeight: 800,
            color: "#2E2E2E",
            fontSize: "1.5rem",
            letterSpacing: "-0.02em",
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
          }}
        >
          잇플
        </Typography>
      </div>
    </div>
  );
}
