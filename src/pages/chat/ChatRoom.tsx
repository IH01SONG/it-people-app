import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export default function ChatRoom() {
  const { roomId } = useParams();
  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight={700}>채팅방</Typography>
      <Typography color="text.secondary">roomId: {roomId}</Typography>
    </Box>
  );
}


