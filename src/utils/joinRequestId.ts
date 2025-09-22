export function extractRequestId(res: any): string | null {
  // 서버 응답 형태를 최대한 유연하게 대응
  return (
    res?.data?.requestId ??
    res?.data?._id ??
    res?.requestId ??
    res?._id ??
    null
  );
}