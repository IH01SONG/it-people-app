import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export default function PostDetail() {
  const { postId } = useParams();
  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight={700}>게시글 상세</Typography>
      <Typography color="text.secondary">postId: {postId}</Typography>
    </Box>
  );
}


