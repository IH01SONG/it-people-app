import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  IconButton,
  Container,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { getDefaultImageByCategory } from "../utils/defaultImages";

interface FormData {
  title: string;
  content: string;
  venue: string;
  category: string;
  maxParticipants: number;
  meetingDate: string;
  tags: string[];
}

export default function EditPost() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  // 이미지 상태 제거 - 카테고리별 기본 이미지만 사용

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    venue: "",
    category: "",
    maxParticipants: 2,
    meetingDate: "",
    tags: [],
  });

  const categories = [
    { id: "68c3bdd957c06e06e2706f85", name: "자기계발", icon: "📚" },
    { id: "68c3bdd957c06e06e2706f86", name: "봉사활동", icon: "🤝" },
    { id: "68c3bdd957c06e06e2706f9a", name: "운동/스포츠", icon: "🏃‍♂️" },
    { id: "68c3bdd957c06e06e2706f9d", name: "문화/예술", icon: "🎨" },
    { id: "68c3bdd957c06e06e2706f9e", name: "사교/인맥", icon: "👥" },
    { id: "68c3bdd957c06e06e2706f87", name: "취미", icon: "🎯" },
    { id: "68c3bdd957c06e06e2706f88", name: "외국어", icon: "🌍" },
    { id: "68c3bdd957c06e06e2706f9c", name: "맛집", icon: "🍽️" },
    { id: "68c3bdd957c06e06e2706fa1", name: "반려동물", icon: "🐕" },
  ];

  // 선택된 카테고리 정보 가져오기
  const getSelectedCategory = () => {
    return categories.find((cat) => cat.id === formData.category);
  };

  // getDefaultImageByCategory 함수는 utils/defaultImages.ts에서 import

  // 게시글 데이터 로드
  useEffect(() => {
    const loadPostData = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        
        // 인증 토큰 확인
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        console.log('🔍 게시글 로드 시작:', postId);
        
        // 현재 사용자의 게시글 목록에서 해당 게시글 찾기
        const response = await api.users.getMyPosts();
        console.log('📋 내 게시글 목록:', response);
        
        const posts = response?.posts || response || [];
        const post = posts.find((p: { _id?: string; id?: string }) => (p._id || p.id) === postId);

        if (!post) {
          console.error('❌ 게시글을 찾을 수 없음:', { postId, postsCount: posts.length });
          alert("본인이 작성한 게시글 중에서 해당 게시글을 찾을 수 없습니다.");
          navigate("/");
          return;
        }

        console.log('✅ 게시글 찾음:', post);

        // 게시글 소유권 확인
        try {
          const currentUser = await api.getMe();
          console.log('👤 현재 사용자 정보:', currentUser);
          console.log('📝 게시글 작성자 정보:', post.author);
          
          const postAuthorId = post.author?._id || post.author?.id || post.author;
          const currentUserId = currentUser._id || currentUser.id;

          console.log('🔍 작성자 ID 비교:', { postAuthorId, currentUserId });

          // 게시글 소유권 확인 (다양한 방식으로 체크)
          const isOwner = postAuthorId === currentUserId ||
                         post.author?.email === currentUser.email ||
                         postAuthorId === currentUser.email ||
                         post.author === currentUserId ||
                         post.authorId === currentUserId ||
                         post.authorId === currentUser.email;

          console.log('✅ 소유권 확인 결과:', isOwner);

          if (!isOwner) {
            console.error('❌ 권한 없음:', { postAuthorId, currentUserId, postAuthor: post.author });
            alert('본인이 작성한 게시글만 수정할 수 있습니다.');
            navigate('/');
            return;
          }
        } catch (userError) {
          console.error('현재 사용자 정보 조회 실패:', userError);
          alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }

        // 폼 데이터 설정
        setFormData({
          title: post.title || "",
          content: post.content || "",
          venue: post.venue || "",
          category:
            typeof post.category === "object"
              ? post.category._id
              : post.category,
          maxParticipants: post.maxParticipants || 2,
          meetingDate: post.meetingDate
            ? new Date(post.meetingDate).toISOString().slice(0, 16)
            : "",
          tags: Array.isArray(post.tags) ? post.tags : [],
        });

        // 이미지는 카테고리별 기본 이미지만 사용 (수정 불가)
      } catch (error) {
        console.error("게시글 로드 실패:", error);
        alert("게시글을 불러오는데 실패했습니다.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadPostData();
  }, [postId, navigate]);

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof FormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 태그 추가
  const addTag = () => {
    if (
      newTag.trim() &&
      !formData.tags.includes(newTag.trim()) &&
      formData.tags.length < 5
    ) {
      updateFormData("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    updateFormData(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.content.trim() &&
      formData.category &&
      formData.maxParticipants >= 2
    );
  };

  // 수정 저장
  const handleSave = async () => {
    if (!isFormValid()) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
        navigate('/login');
        return;
      }

      // 현재 사용자 정보 재확인
      const currentUser = await api.getMe();
      console.log('💾 수정 시 사용자 정보 재확인:', currentUser);

      // 카테고리에 맞는 기본 이미지 자동 추가
      let finalImageUrls: string[] = [];
      if (formData.category) {
        const defaultImage = getDefaultImageByCategory(formData.category);
        finalImageUrls = [defaultImage];
      }

      const updateData = {
        title: formData.title.trim(),
        venue: formData.venue.trim(),
        category: formData.category,
        maxParticipants: formData.maxParticipants,
        meetingDate: formData.meetingDate
          ? new Date(formData.meetingDate).toISOString()
          : undefined,
        tags: formData.tags,
        content: formData.content.trim(),
        // 이미지 필드 - 백엔드 호환성을 위해 둘 다 전송
        ...(finalImageUrls.length > 0 && {
          imageUrls: finalImageUrls,
          images: finalImageUrls // 백엔드 호환성을 위해 추가
        }),
      };

      // 백엔드 API 호출 전 디버깅
      console.log('🚀 전송할 수정 데이터:', JSON.stringify(updateData, null, 2));

      console.log('💾 게시글 수정 API 호출 시작');
      await api.posts.update(postId!, updateData);
      console.log('✅ 게시글 수정 완료');

      alert("게시글이 수정되었습니다.");
      navigate("/", { state: { refreshPosts: true } });
    } catch (error: any) {
      console.error("❌ 게시글 수정 실패:", error);
      console.error("❌ 오류 상태:", error?.response?.status);
      console.error("❌ 오류 데이터:", error?.response?.data);

      let errorMessage = "게시글 수정에 실패했습니다.";

      // 403 오류 처리
      if (error?.response?.status === 403) {
        errorMessage = error?.response?.data?.message || "이 게시글을 수정할 권한이 없습니다.";
        console.error("🚫 권한 오류:", errorMessage);
      }
      // 401 오류 처리
      else if (error?.response?.status === 401) {
        errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요.";
        console.error("🔑 인증 오류:", errorMessage);
        localStorage.removeItem('access_token');
        navigate('/login');
        return;
      }
      // 404 오류 처리
      else if (error?.response?.status === 404) {
        errorMessage = "게시글을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.";
        console.error("🔍 게시글 없음:", errorMessage);
      }
      // 기타 오류
      else {
        errorMessage = error?.response?.data?.message || error?.message || "게시글 수정에 실패했습니다.";
        console.error("⚠️ 기타 오류:", errorMessage);
      }

      alert(`오류: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        "@media (min-width:600px)": {
          maxWidth: "600px",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#E762A9",
          color: "white",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(231, 98, 169, 0.3)",
        }}
      >
        <IconButton onClick={() => navigate("/")} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            mr: 4,
            fontWeight: 700,
          }}
        >
          모임 수정하기
        </Typography>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          px: 3,
          py: 3,
          maxWidth: "600px !important",
          "@media (min-width: 600px)": {
            maxWidth: "600px !important",
          },
        }}
      >
        {/* 프로그레스 */}
        <Box mb={4}>
          <Stepper activeStep={1} sx={{ mb: 2 }}>
            <Step>
              <StepLabel>카테고리 선택</StepLabel>
            </Step>
            <Step>
              <StepLabel>상세 정보</StepLabel>
            </Step>
            <Step>
              <StepLabel>완료</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* 선택된 카테고리 표시 */}
        {getSelectedCategory() && (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              p: 2,
              mb: 3,
              background: "linear-gradient(135deg, #E762A9 0%, #D554A0 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4">
                {getSelectedCategory()?.icon}
              </Typography>
              <Box>
                <Typography variant="h6" color="white" fontWeight={600}>
                  {getSelectedCategory()?.name}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.8)">
                  선택된 카테고리
                </Typography>
              </Box>
            </Box>
          </Card>
        )}

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.05)",
            bgcolor: "#ffffff",
          }}
        >
          {/* 제목 */}
          <Box mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              모임 제목 *
            </Typography>
            <TextField
              fullWidth
              placeholder="어떤 모임인지 간단히 알려주세요"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* 카테고리 */}
          <Box mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              카테고리 *
            </Typography>
            <FormControl fullWidth>
              <Select
                value={formData.category}
                onChange={(e) => updateFormData("category", e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 내용 */}
          <Box mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              모임 설명 *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="모임에 대해 자세히 설명해주세요"
              value={formData.content}
              onChange={(e) => updateFormData("content", e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* 만날 장소 */}
          <Box mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              만날 장소
            </Typography>
            <TextField
              fullWidth
              placeholder="구체적인 만날 장소를 입력해주세요"
              value={formData.venue}
              onChange={(e) => updateFormData("venue", e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* 모임 일시 */}
          <Box mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              모임 일시
            </Typography>
            <TextField
              fullWidth
              type="datetime-local"
              value={formData.meetingDate}
              onChange={(e) => updateFormData("meetingDate", e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* 최대 인원 */}
          <Box mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              최대 참여 인원 *
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={() =>
                  updateFormData(
                    "maxParticipants",
                    Math.max(2, formData.maxParticipants - 1)
                  )
                }
                disabled={formData.maxParticipants <= 2}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  "&:disabled": { opacity: 0.5 },
                }}
              >
                <RemoveIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ minWidth: 40, textAlign: "center" }}
              >
                {formData.maxParticipants}
              </Typography>
              <IconButton
                onClick={() =>
                  updateFormData(
                    "maxParticipants",
                    Math.min(20, formData.maxParticipants + 1)
                  )
                }
                disabled={formData.maxParticipants >= 20}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  "&:disabled": { opacity: 0.5 },
                }}
              >
                <AddIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                명 (최소 2명, 최대 20명)
              </Typography>
            </Box>
          </Box>

          {/* 태그 */}
          <Box mb={4}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              color="#333"
            >
              태그 (최대 5개)
            </Typography>

            {/* 기존 태그들 */}
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  onDelete={() => removeTag(tag)}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "#E91E63",
                    color: "#E91E63",
                    "& .MuiChip-deleteIcon": {
                      color: "#E91E63",
                    },
                  }}
                />
              ))}
            </Box>

            {/* 새 태그 입력 */}
            {formData.tags.length < 5 && (
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="태그 입력"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  sx={{
                    borderColor: "#E91E63",
                    color: "#E91E63",
                    "&:hover": {
                      borderColor: "#C2185B",
                      backgroundColor: "rgba(233, 30, 99, 0.04)",
                    },
                  }}
                >
                  추가
                </Button>
              </Box>
            )}
          </Box>

          {/* 수정 버튼 */}
          <Box display="flex" gap={2} mt={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                py: 1.5,
                borderRadius: 3,
                borderColor: "#ddd",
                color: "#666",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#bbb",
                  backgroundColor: "rgba(0,0,0,0.02)",
                },
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
              disabled={!isFormValid() || saving}
              sx={{
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, #E762A9 0%, #D554A0 100%)",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(231, 98, 169, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #D554A0 0%, #C94694 100%)",
                  boxShadow: "0 6px 16px rgba(231, 98, 169, 0.4)",
                },
                "&:disabled": {
                  background: "#ccc",
                  boxShadow: "none",
                },
              }}
            >
              {saving ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "수정 완료"
              )}
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
