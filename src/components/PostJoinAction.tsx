import { useJoinCancel } from '../hooks/useJoinCancel';
import { useState } from 'react';
import { Button } from '@mui/material';
import logoSvg from '../assets/logo.png';

export function PostJoinAction({ postId, disabled = false }: { postId: string; disabled?: boolean }) {
  const { loading, isPending, apply, cancel } = useJoinCancel(postId);
  const [msg, setMsg] = useState<string | null>(null);

  const onApply = async () => {
    setMsg(null);
    try {
      await apply();
      setMsg('참여 신청이 접수되었습니다.');
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? '신청에 실패했습니다.');
    }
  };

  const onCancel = async () => {
    setMsg(null);
    try {
      await cancel();
      setMsg('신청을 취소했습니다.');
    } catch (e: any) {
      const s = e?.response?.status;
      if (s === 400) setMsg('이미 처리된 신청은 취소할 수 없습니다.');
      else if (s === 403) setMsg('취소 권한이 없습니다.');
      else if (s === 404) setMsg('신청 정보를 찾을 수 없습니다.');
      else setMsg('취소에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {!isPending ? (
        <Button
          onClick={onApply}
          disabled={disabled || loading}
          sx={{
            bgcolor: disabled ? "#CCCCCC" : "#E91E63",
            color: "white",
            borderRadius: 20,
            px: 2,
            py: 0.5,
            fontSize: "0.8rem",
            fontWeight: 600,
            minWidth: "auto",
            "&:hover": {
              bgcolor: disabled ? "#CCCCCC" : "#C2185B",
              transform: disabled ? "none" : "scale(1.05)",
            },
            "&:disabled": {
              bgcolor: "#CCCCCC",
              color: "#999999",
            },
            transition: "all 0.2s ease",
            boxShadow: disabled ? "none" : "0 2px 8px rgba(233, 30, 99, 0.3)",
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
          {loading ? '처리 중…' : disabled ? '마감' : '잇플'}
        </Button>
      ) : (
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            bgcolor: "#C2185B",
            color: "white",
            borderRadius: 20,
            px: 2,
            py: 0.5,
            fontSize: "0.8rem",
            fontWeight: 600,
            minWidth: "auto",
            "&:hover": {
              bgcolor: "#9C1346",
              transform: "scale(1.05)",
            },
            "&:disabled": {
              bgcolor: "#CCCCCC",
              color: "#999999",
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
          {loading ? '처리 중…' : '신청됨'}
        </Button>
      )}
      {msg && <span className="text-xs text-gray-600 mt-1">{msg}</span>}
    </div>
  );
}