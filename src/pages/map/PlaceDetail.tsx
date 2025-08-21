import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export default function PlaceDetail() {
  const { placeId } = useParams();
  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight={700}>장소 상세</Typography>
      <Typography color="text.secondary">placeId: {placeId}</Typography>
    </Box>
  );
}


