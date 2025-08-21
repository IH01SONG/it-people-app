import { Box, Skeleton, Stack } from "@mui/material";

export default function RouteFallbackSkeleton() {
  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
        <Skeleton variant="text" height={28} />
        <Skeleton variant="text" height={28} width="80%" />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  );
}


