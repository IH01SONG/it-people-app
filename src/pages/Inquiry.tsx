import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, Accordion, AccordionSummary, AccordionDetails, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

interface ChatbotQuestion {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const predefinedQuestions: ChatbotQuestion[] = [
  {
    id: 1,
    question: '모임에 참여하려면 어떻게 해야 하나요?',
    answer: '홈 화면에서 관심 있는 모임을 찾아 "참여 신청" 버튼을 누르시면 됩니다. 모임 주최자가 승인하면 참여가 확정됩니다. 참여 전에 모임 상세 정보와 참여 조건을 꼼꼼히 확인해주세요.',
    category: '모임 참여'
  },
  {
    id: 2,
    question: '위치 정보는 어떻게 사용되나요?',
    answer: '위치 정보는 근처 모임을 찾아드리고, 안전한 모임 참여를 위해 사용됩니다. 위치 정보는 모임 매칭 목적으로만 사용되며, 개인정보보호법에 따라 안전하게 관리됩니다. 언제든지 위치 정보 수집을 중단할 수 있습니다.',
    category: '위치 서비스'
  },
  {
    id: 3,
    question: '모임을 직접 만들 수 있나요?',
    answer: '네, 가능합니다! 홈 화면 하단의 "+" 버튼을 눌러 모임을 생성할 수 있습니다. 모임 제목, 설명, 날짜, 장소, 참여 인원 등을 설정하실 수 있습니다. 모임 생성 시 참여 조건과 주의사항을 명확히 기재해주세요.',
    category: '모임 생성'
  },
  {
    id: 4,
    question: '다른 사용자와 채팅은 어떻게 하나요?',
    answer: '모임에 참여하신 후, 모임 상세 페이지에서 "채팅 참여" 버튼을 누르시면 해당 모임의 채팅방에 참여할 수 있습니다. 개인 메시지는 현재 지원하지 않으며, 모임 채팅을 통해서만 소통이 가능합니다.',
    category: '소통'
  },
  {
    id: 5,
    question: '프로필 사진은 어떻게 변경하나요?',
    answer: '마이페이지에서 프로필 사진 옆의 "+" 버튼을 누르시면 카메라로 촬영하거나 갤러리에서 사진을 선택할 수 있습니다. 개인정보 수정 페이지에서도 동일하게 변경 가능합니다.',
    category: '계정 관리'
  },
  {
    id: 6,
    question: '모임 참여를 취소할 수 있나요?',
    answer: '네, 가능합니다. 마이페이지 > 내 활동에서 참여 신청한 모임을 확인하고 "참여 취소" 버튼을 누르시면 됩니다. 단, 모임 시작 24시간 전까지만 취소가 가능합니다.',
    category: '모임 참여'
  },
  {
    id: 7,
    question: '부적절한 사용자를 신고할 수 있나요?',
    answer: '네, 가능합니다. 사용자 프로필에서 "신고" 버튼을 누르시거나, 고객센터로 문의해주세요. 신고된 내용은 검토 후 적절한 조치를 취하겠습니다. 신고 시 구체적인 사유를 기재해주시면 도움이 됩니다.',
    category: '신고/안전'
  },
  {
    id: 8,
    question: '앱이 자주 종료되거나 느려요.',
    answer: '앱을 최신 버전으로 업데이트해주시고, 기기의 저장 공간을 확인해주세요. 문제가 지속되면 기기를 재시작하거나 앱을 삭제 후 재설치해보세요. 그래도 해결되지 않으면 고객센터로 문의해주세요.',
    category: '기술 지원'
  },
  {
    id: 9,
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하시고, 가입 시 사용한 이메일 주소를 입력해주세요. 이메일로 비밀번호 재설정 링크를 보내드립니다. 이메일이 오지 않으면 스팸함을 확인해주세요.',
    category: '계정 관리'
  },
  {
    id: 10,
    question: '회원 탈퇴는 어떻게 하나요?',
    answer: '마이페이지 > 설정 > 계정관리에서 "회원 탈퇴"를 선택하실 수 있습니다. 탈퇴 시 모든 개인정보가 삭제되며, 복구가 불가능합니다. 탈퇴 전에 중요한 데이터를 백업해주세요.',
    category: '계정 관리'
  },
  {
    id: 11,
    question: '모임에서 실제로 만날 때 주의사항이 있나요?',
    answer: '공공장소에서 만나시고, 처음에는 낯선 사람과의 만남이므로 안전을 최우선으로 생각해주세요. 모임 전에 주최자와 충분히 소통하고, 의심스러운 상황이 있다면 즉시 신고해주세요. 개인정보는 절대 공유하지 마세요.',
    category: '신고/안전'
  },
  {
    id: 12,
    question: '알림을 끄고 싶어요.',
    answer: '마이페이지 > 설정 > 알림 설정에서 알림을 끄거나 조정할 수 있습니다. 모임 관련 알림, 메시지 알림, 마케팅 알림 등을 개별적으로 설정하실 수 있습니다.',
    category: '설정'
  },
];

const Inquiry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
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

  // 카테고리 목록 생성
  const categories = ['전체', ...Array.from(new Set(predefinedQuestions.map(q => q.category)))];

  // 필터링된 질문 목록
  const filteredQuestions = predefinedQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuestionClick = (_question: ChatbotQuestion) => {
    // setSelectedQuestion(question);
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
      // setSelectedQuestion(null); // Clear selected question after submission
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
        <Typography variant="h5" mb={3} textAlign="center" fontWeight={600}>
          자주 묻는 질문
        </Typography>

        {/* 검색 및 카테고리 필터 */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="궁금한 내용을 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                color={selectedCategory === category ? 'primary' : 'default'}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Box>

        {/* 질문 목록 */}
        <Stack spacing={1} mb={4}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => (
              <Accordion key={q.id} elevation={1}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  onClick={() => handleQuestionClick(q)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Chip 
                      label={q.category} 
                      size="small" 
                      sx={{ mr: 2, minWidth: '80px' }}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      {q.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {q.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                검색 결과가 없습니다.
              </Typography>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 4 }} />

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
