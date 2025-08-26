import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface ChatbotQuestion {
  id: number;
  question: string;
  answer: string;
}

const predefinedQuestions: ChatbotQuestion[] = [
  {
    id: 1,
    question: 'IT인 재직자 확인은 어떻게 하나요?',
    answer: 'IT인 재직자 확인은 회사 이메일 또는 재직증명서 제출을 통해 이루어집니다.',
  },
  {
    id: 2,
    question: '파트너십 문의는 어떻게 하나요?',
    answer: '파트너십 문의는 제휴 문의 페이지를 통해 상세 내용을 작성해주시면 담당자가 연락드립니다.',
  },
  {
    id: 3,
    question: '개인 정보 변경은 어떻게 하나요?',
    answer: '개인 정보 변경은 마이페이지 > 설정 > 개인 정보 수정에서 가능합니다.',
  },
  {
    id: 4,
    question: '서비스 이용에 문제가 발생했어요.',
    answer: '서비스 이용에 문제가 발생한 경우, 상세 내용을 고객센터에 문의해주시면 신속하게 도와드리겠습니다.',
  },
];

const Inquiry: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<ChatbotQuestion | null>(null);
  const navigate = useNavigate();

  const handleQuestionClick = (question: ChatbotQuestion) => {
    setSelectedQuestion(question);
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          고객 문의
        </Typography>
      </Box>
      <Box p={2}>
        <Typography variant="body1" mb={3}>궁금한 점을 선택해주세요!</Typography>

        <Stack spacing={2} mb={4}>
          {predefinedQuestions.map((q) => (
            <Button
              key={q.id}
              variant="outlined"
              fullWidth
              onClick={() => handleQuestionClick(q)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 2,
                px: 3,
                borderColor: selectedQuestion?.id === q.id ? 'primary.main' : undefined,
                color: selectedQuestion?.id === q.id ? 'primary.main' : 'text.primary',
              }}
            >
              {q.question}
            </Button>
          ))}
        </Stack>

        {selectedQuestion && (
          <Box mt={4} p={3} sx={{ bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Q: {selectedQuestion.question}
            </Typography>
            <Typography variant="body1">
              A: {selectedQuestion.answer}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Inquiry;
