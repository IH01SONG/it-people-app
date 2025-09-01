// MUI 아이콘
import LocationOnIcon from "@mui/icons-material/LocationOn";

// 로고 이미지
import logoSvg from "../assets/logo.png";

// MUI 컴포넌트
import {
  Card,
  Typography,
  Box,
  Button,
} from "@mui/material";

// 타입 정의
import type { Post } from "../types/home.types";

/**
 * PostCard 컴포넌트 Props 정의
 */
interface PostCardProps {
  post: Post; // 게시글 데이터
  onJoinRequest: (postId: string) => void; // 참여 신청 콜백
  isApplied?: boolean; // 신청 상태
}

/**
 * 게시글 카드 컴포넌트
 * 모임 게시글의 정보를 카드 형태로 표시하고 참여 신청 기능을 제공
 */
export default function PostCard({ post, onJoinRequest, isApplied = false }: PostCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {post.image && (
        <Box sx={{ height: 200, overflow: "hidden" }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      <Box p={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {post.author}
            </Typography>
            <span className="text-xs text-gray-400">•</span>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOnIcon sx={{ fontSize: 12, color: "#E91E63" }} />
              <Typography
                variant="caption"
                color="#E91E63"
                fontWeight={500}
              >
                {post.location.address || `${post.location.coordinates[1].toFixed(3)}, ${post.location.coordinates[0].toFixed(3)}`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={0.5} alignItems="center">
            <span
              className={`text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700`}
            >
              {post.category}
            </span>
            {post.status === 'full' && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                마감
              </span>
            )}
          </Box>
        </Box>

        <Typography
          variant="h6"
          fontWeight={600}
          color="#333"
          mb={1}
          lineHeight={1.3}
        >
          {post.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={1}
          lineHeight={1.5}
        >
          {post.content}
        </Typography>
        
        {/* 태그 표시 */}
        {post.tags && post.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </Box>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <span className="text-xs text-gray-500">인원</span>
              <Typography variant="caption" color="text.secondary">
                {post.participants.length}/{post.maxParticipants}명
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                조회 {post.viewCount}
              </Typography>
              <span className="text-xs text-gray-400">•</span>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={() => onJoinRequest(post.id)}
            sx={{
              bgcolor: isApplied ? "#C2185B" : "#E91E63",
              color: "white",
              borderRadius: 20,
              px: 2,
              py: 0.5,
              fontSize: "0.8rem",
              fontWeight: 600,
              minWidth: "auto",
              "&:hover": {
                bgcolor: isApplied ? "#9C1346" : "#C2185B",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(233, 30, 99, 0.3)",
            }}
            startIcon={
              <img 
                src={logoSvg} 
                alt="잇플 로고" 
                style={{ 
                  width: "14px", 
                  height: "14px",
                  filter: "brightness(0) invert(1)"
                }} 
              />
            }
          >
            잇플
          </Button>
        </Box>
      </Box>
    </Card>
  );
}