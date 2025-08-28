import { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  Stepper,
  Step,
  StepLabel,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function Step1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    location: "",
    category: "",
    content: "",
    meetingDate: "",
    tags: [] as string[]
  });

  const hongdaeVenues = [
    "파파존스 홍대점",
    "블루보틀 홍대점", 
    "스타벅스 홍대점",
    "홍대 메가박스",
    "홍대 AK&홍대",
    "홍대 던킨도너츠",
    "홍대 KFC",
    "홍대 맥도날드",
    "홍대 카페베네",
    "홍대 이디야커피"
  ];

  const meetupCategories = [
    "식사",
    "카페/디저트", 
    "스터디/코딩",
    "게임",
    "쇼핑",
    "영화/문화",
    "운동",
    "기타"
  ];

  const handleSubmit = () => {
    if (formData.title.trim() && formData.venue && formData.category) {
      // 위치 정보 추가
      const formDataWithLocation = {
        ...formData,
        location: formData.venue ? `홍대입구역 ${formData.venue.split(' ')[0]}` : "홍대입구"
      };
      navigate('/new/step2', { state: formDataWithLocation });
    }
  };

  const isFormValid = formData.title.trim().length > 0 && formData.venue && formData.category;

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 bg-white min-h-screen">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between py-4">
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600} color="#333">
          새 모임 만들기
        </Typography>
        <div className="w-10"></div>
      </div>

      {/* 프로그레스 */}
      <Box mb={4}>
        <Stepper activeStep={0} sx={{ mb: 2 }}>
          <Step>
            <StepLabel>기본 정보</StepLabel>
          </Step>
          <Step>
            <StepLabel>상세 내용</StepLabel>
          </Step>
          <Step>
            <StepLabel>완료</StepLabel>
          </Step>
        </Stepper>
      </Box>

      {/* 메인 폼 카드 */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box mb={3}>
          <div className="text-xl mb-2 text-center font-bold">모임 생성</div>
          <Typography variant="h6" fontWeight={600} textAlign="center" mb={1}>
            어떤 모임을 만들고 싶으신가요?
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            홍대 근처에서 함께할 활동과 장소를 선택해주세요
          </Typography>
        </Box>

        <Box component="form" sx={{ space: 3 }}>
          <TextField
            fullWidth
            label="모임 제목"
            placeholder="예: 홍대 피자집에서 저녁 같이 먹어요"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            sx={{ mb: 3 }}
            required
            multiline
            rows={2}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>만날 장소</InputLabel>
            <Select
              value={formData.venue}
              label="만날 장소"
              onChange={(e) => {
                const venue = e.target.value;
                setFormData({
                  ...formData, 
                  venue
                });
              }}
            >
              {hongdaeVenues.map((venue) => (
                <MenuItem key={venue} value={venue}>
                  {venue}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={formData.category}
              label="카테고리"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {meetupCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="모임 설명"
            placeholder="어떤 활동을 하고 싶은지, 언제 만날지 자세히 설명해주세요"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />
        </Box>
      </Card>

      {/* 예시 카드 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <div className="text-lg font-bold">예시</div>
          <Typography variant="subtitle1" fontWeight={600}>
            모임 예시
          </Typography>
        </Box>
        <div className="space-y-2 text-sm text-gray-600">
          <div>• "홍대 스타벅스에서 코딩 스터디 함께해요"</div>
          <div>• "블루보틀에서 디저트 먹으면서 수다떨어요"</div>
          <div>• "메가박스에서 영화 보고 싶은데 같이 가실 분"</div>
          <div>• "AK홍대에서 쇼핑하고 맛집 투어 어떠세요?"</div>
        </div>
      </Card>

      {/* 하단 버튼 */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid}
            sx={{
              bgcolor: '#FFD700',
              color: '#333',
              fontWeight: 700,
              borderRadius: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: '#FFC107',
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            다음 단계로
          </Button>
        </div>
      </Box>
    </div>
  );
}


