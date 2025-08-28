// React hooks
import { useState } from "react";

// MUI 아이콘
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// MUI 컴포넌트
import {
  IconButton,
  Card,
  Typography,
  Box,
  Button,
  Collapse,
} from "@mui/material";

// 타입 정의
import type { Activity } from "../types/home.types";

/**
 * MyActivities 컴포넌트 Props 정의
 */
interface MyActivitiesProps {
  activities: Activity[]; // 내 모임 활동 목록
}

/**
 * 내 모임 활동 컴포넌트
 * 사용자가 참여하거나 주최하는 모임 활동들을 표시
 */
export default function MyActivities({ activities }: MyActivitiesProps) {
  const [expanded, setExpanded] = useState(true); // 확장/축소 상태

  // 활동이 없으면 컴포넌트를 렌더링하지 않음
  if (activities.length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        mb: 3,
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2.5,
          cursor: "pointer",
          borderBottom: expanded
            ? "1px solid rgba(0,0,0,0.1)"
            : "none",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.02)",
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <div className="text-2xl">📋</div>
            <Box>
              <Typography variant="h6" fontWeight={600} color="#333">
                내 모임 활동
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activities.length}개의 모임
              </Typography>
            </Box>
          </Box>
          <IconButton sx={{ transition: "transform 0.3s ease" }}>
            {expanded ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2.5, pt: 0 }}>
          <div className="space-y-3 pt-3">
            {activities.map((item) => (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  p: 2,
                  border: "1px solid rgba(0,0,0,0.05)",
                  bgcolor: "rgba(248,249,250,0.5)",
                }}
              >
                <Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={0.5}
                    flexWrap="wrap"
                  >
                    <span className="text-sm">{item.category}</span>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#333"
                    >
                      {item.title}
                    </Typography>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        item.role === "주최자"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.role}
                    </span>
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={2}
                    flexWrap="wrap"
                  >
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "모집 완료"
                          ? "bg-green-100 text-green-700"
                          : item.status === "대기 중"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <Typography variant="caption" color="text.secondary">
                      {item.time}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <span className="text-xs text-gray-500">인원</span>
                    <Typography variant="caption" color="text.secondary">
                      {item.members}/{item.maxMembers}명
                    </Typography>
                    {item.role === "주최자" &&
                      item.status !== "모집 완료" && (
                        <Typography
                          variant="caption"
                          color="#E91E63"
                          sx={{ ml: 1 }}
                        >
                          • 대기 중인 신청 3명
                        </Typography>
                      )}
                  </Box>

                  {item.role === "주최자" && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.7rem",
                          py: 0.5,
                          px: 1.5,
                          borderColor: "#666",
                          color: "#666",
                          "&:hover": {
                            borderColor: "#333",
                            bgcolor: "rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        수정
                      </Button>
                      {item.status !== "모집 완료" && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              fontSize: "0.7rem",
                              py: 0.5,
                              px: 1.5,
                              bgcolor: "#4CAF50",
                              "&:hover": {
                                bgcolor: "#45a049",
                              },
                            }}
                          >
                            신청 수락 (3)
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.7rem",
                              py: 0.5,
                              px: 1.5,
                              borderColor: "#f44336",
                              color: "#f44336",
                              "&:hover": {
                                borderColor: "#d32f2f",
                                bgcolor: "rgba(244, 67, 54, 0.04)",
                              },
                            }}
                          >
                            신청 거절
                          </Button>
                        </>
                      )}
                    </Box>
                  )}

                  {item.role === "참여자" && (
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.7rem",
                          py: 0.5,
                          px: 1.5,
                          borderColor: "#f44336",
                          color: "#f44336",
                          "&:hover": {
                            borderColor: "#d32f2f",
                            bgcolor: "rgba(244, 67, 54, 0.04)",
                          },
                        }}
                      >
                        참여 취소
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            ))}
          </div>
        </Box>
      </Collapse>
    </Card>
  );
}