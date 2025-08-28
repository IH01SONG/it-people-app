import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  IconButton,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Rating,
  LinearProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useNavigate, useLocation } from "react-router-dom";

interface SubmissionData {
  title: string;
  venue: string;
  location: string;
  category: string;
  content: string;
  meetingTime: string;
  duration: string;
  maxParticipants: string;
  additionalInfo: string;
  tags: string[];
}

interface FeedbackItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
}

export default function FeedbackResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    if (location.state) {
      setSubmissionData(location.state as SubmissionData);
    }

    setTimeout(() => {
      setFeedbacks([
        {
          id: '1',
          author: '홍대 자주가는 사람',
          rating: 5,
          comment: '좋은 모임이네요! 시간도 적절하고 장소도 찾기 쉬워서 참여하고 싶어요. 혼자 가기 아쉬웠던 곳인데 같이 가면 더 재밌을 것 같아요!',
          timestamp: '방금 전',
          helpful: 12
        },
        {
          id: '2',
          author: '동네 주민',
          rating: 4,
          comment: '근처에 살고 있는데 같은 취향을 가진 사람을 만날 수 있어서 좋네요. 시간 맞춰서 참여해보고 싶습니다!',
          timestamp: '5분 전',
          helpful: 8
        },
        {
          id: '3',
          author: '모임 러버',
          rating: 4,
          comment: '홍대에서 이런 모임 자주 참여하는데 좋은 아이디어네요! 새로운 사람들과 만나는 게 항상 즐거워요.',
          timestamp: '1시간 전',
          helpful: 5
        }
      ]);
      setLoading(false);
    }, 1500);
  }, [location.state]);

  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
    : 0;

  if (!submissionData) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 bg-white min-h-screen flex items-center justify-center">
        <Typography>데이터를 불러올 수 없습니다.</Typography>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 bg-white min-h-screen">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between py-4">
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600} color="#333">
          모임 생성 완료
        </Typography>
        <IconButton>
          <ShareIcon />
        </IconButton>
      </div>

      {/* 프로그레스 완료 */}
      <Box mb={4}>
        <Stepper activeStep={2} sx={{ mb: 2 }}>
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

      {/* 제출 성공 카드 */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          p: 3,
          mb: 3,
          textAlign: 'center'
        }}
      >
        <div className="text-2xl mb-2 font-bold text-green-600">완료!</div>
        <Typography variant="h6" color="white" fontWeight={700} mb={1}>
          모임 만들기 완료!
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.9)">
          다른 사람들이 참여 신청을 시작했어요
        </Typography>
      </Card>

      {/* 제목 요약 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Typography variant="body2" color="text.secondary" mb={1}>
          만든 모임
        </Typography>
        <Typography variant="h6" fontWeight={700} color="#333" mb={2}>
          "{submissionData.title}"
        </Typography>
        
        <Typography variant="body2" color="text.secondary" mb={2}>
          장소: {submissionData.venue} • {submissionData.category}
        </Typography>
        
        {submissionData.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {submissionData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{ bgcolor: '#FFD700', color: '#333' }}
              />
            ))}
          </Box>
        )}

        {submissionData.meetingTime && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            모임 시간: {submissionData.meetingTime}
          </Typography>
        )}
        
        {submissionData.maxParticipants && (
          <Typography variant="body2" color="text.secondary">
            최대 인원: {submissionData.maxParticipants}
          </Typography>
        )}
      </Card>

      {/* 피드백 요약 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>
          참여 반응
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Rating value={averageRating} readOnly precision={0.1} />
          <Typography variant="h6" fontWeight={700} color="#333">
            {averageRating.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({feedbacks.length}개 반응)
          </Typography>
        </Box>

        <Box display="flex" justify="space-between" gap={2}>
          <Box flex={1} textAlign="center">
            <Typography variant="h6" fontWeight={700} color="#4CAF50">
              {feedbacks.filter(f => f.rating >= 4).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              긍정적
            </Typography>
          </Box>
          <Box flex={1} textAlign="center">
            <Typography variant="h6" fontWeight={700} color="#FF9800">
              {feedbacks.filter(f => f.rating === 3).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              보통
            </Typography>
          </Box>
          <Box flex={1} textAlign="center">
            <Typography variant="h6" fontWeight={700} color="#f44336">
              {feedbacks.filter(f => f.rating <= 2).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              개선 필요
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 피드백 목록 */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        받은 피드백
      </Typography>

      {loading ? (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            p: 3,
            mb: 3,
            textAlign: 'center'
          }}
        >
          <div className="text-2xl mb-2">⏳</div>
          <Typography variant="body1" mb={2}>피드백을 수집하고 있어요</Typography>
          <LinearProgress sx={{ borderRadius: 2 }} />
        </Card>
      ) : (
        <div className="space-y-3 mb-4">
          {feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                p: 3,
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="#333">
                    {feedback.author}
                  </Typography>
                  <Rating value={feedback.rating} readOnly size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {feedback.timestamp}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.primary" mb={3} lineHeight={1.6}>
                {feedback.comment}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small">
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  도움됨 {feedback.helpful}
                </Typography>
              </Box>
            </Card>
          ))}
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="space-y-2 mb-4">
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/new/step1')}
          sx={{
            bgcolor: '#FFD700',
            color: '#333',
            fontWeight: 700,
            borderRadius: 3,
            py: 1.5,
            '&:hover': {
              bgcolor: '#FFC107',
            }
          }}
        >
          새로운 제목 제출하기
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{
            borderColor: '#FFD700',
            color: '#333',
            fontWeight: 600,
            borderRadius: 3,
            py: 1.5,
            '&:hover': {
              borderColor: '#FFC107',
              bgcolor: 'rgba(255, 215, 0, 0.04)'
            }
          }}
        >
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}