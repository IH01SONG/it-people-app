import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuestionClick = (question: ChatbotQuestion) => {
    setSelectedQuestion(question);
    setSubmitMessage(null); // Clear submit message when a question is clicked
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitMessage('모든 필드를 채워주세요.');
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      console.log('Form Data Submitted:', formData, 'Files:', files);
      setSubmitMessage('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setFiles([]); // Clear selected files after submission
      setSelectedQuestion(null); // Clear selected question after submission
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
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

        <Typography variant="h5" mt={6} mb={3} textAlign="center">직접 문의하기</Typography>
        <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
          궁금한 점을 찾을 수 없거나 추가 지원이 필요한 경우, 아래 양식을 작성해 주세요.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="이름"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="제목"
            name="subject"
            value={formData.subject}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            required
          />
          <TextareaAutosize
            minRows={5}
            placeholder="문의 내용을 작성해주세요."
            name="message"
            value={formData.message}
            onChange={handleFormChange}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px 14px',
              fontSize: '1rem',
              lineHeight: 1.5,
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '16px',
              marginBottom: '8px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            required
          />
          <InputLabel htmlFor="file-upload" sx={{ mt: 2, mb: 1 }}>사진 첨부 (선택 사항)</InputLabel>
          <Input
            id="file-upload"
            type="file"
            inputProps={{ multiple: true, accept: 'image/*' }}
            onChange={handleFileChange}
            sx={{ display: 'none' }} // Hide the default file input
          />
          <Button
            variant="outlined"
            component="label"
            htmlFor="file-upload"
            fullWidth
            sx={{ mt: 1, py: 1 }}
          >
            파일 선택
          </Button>
          {files.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                선택된 파일: {files.map((file) => file.name).join(', ')}
              </Typography>
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 2, py: 1.5 }}
          >
            {isSubmitting ? '전송 중...' : '보내기'}
          </Button>
          {submitMessage && (
            <Typography
              variant="body2"
              color={submitMessage.includes('성공') ? 'success.main' : 'error.main'}
              mt={2}
              textAlign="center"
            >
              {submitMessage}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Inquiry;
