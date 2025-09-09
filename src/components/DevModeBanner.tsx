import { Box, Typography, Chip, Alert } from "@mui/material";
import { Code as CodeIcon } from "@mui/icons-material";

const USE_MOCK_DATA = import.meta.env?.VITE_USE_MOCK_DATA === 'true';

export default function DevModeBanner() {
  if (!USE_MOCK_DATA) return null;

  return (
    <Alert 
      severity="info" 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        border: '2px solid #2196F3',
        backgroundColor: '#E3F2FD'
      }}
      icon={<CodeIcon />}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2" fontWeight={600}>
          개발 모드 활성화
        </Typography>
        <Chip 
          label="MOCK DATA" 
          size="small" 
          sx={{ 
            bgcolor: '#2196F3', 
            color: 'white',
            fontSize: '0.7rem',
            height: 20
          }} 
        />
      </Box>
      <Typography variant="caption" display="block" mt={0.5}>
        현재 목 데이터를 사용 중입니다. .env에서 VITE_USE_MOCK_DATA=false로 변경하면 실제 서버에 연결됩니다.
      </Typography>
    </Alert>
  );
}