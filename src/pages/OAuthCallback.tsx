import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { setAuthToken } from "../lib/axios";

export default function OAuthCallback() {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = search.get("token"); // 또는 code

    if (token && token !== "null" && token !== "undefined") {
      // 토큰이 직접 전달된 경우
      localStorage.setItem("access_token", token); // 필요 시 setAuthToken(token)
      setAuthToken(token);
      
      // TODO: 백엔드에 검증/프로필 불러오기 등
      api.getMe().catch(() => { /* 무시해도 됨 */ });
      
      navigate("/", { replace: true }); // 원하는 곳으로 이동
    } else {
      // code 기반이라면 여기서 백엔드로 교환 요청
      const code = search.get("code");
      
      if (code) {
        // 인증 코드를 서버에 전송하여 토큰 교환
        fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: window.location.origin + '/auth/callback'
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const token = data.token || data.access_token || data.jwt;
          if (token) {
            localStorage.setItem("access_token", token);
            setAuthToken(token);
            api.getMe().catch(() => { /* 무시해도 됨 */ });
            navigate("/", { replace: true });
          } else {
            throw new Error('서버에서 토큰을 받지 못했습니다.');
          }
        })
        .catch(error => {
          console.error('토큰 교환 실패:', error);
          navigate("/login", { replace: true });
        });
      } else {
        // 토큰도 코드도 없는 경우
        navigate("/login", { replace: true });
      }
    }
  }, [search, navigate]);

  return <div>로그인 처리 중...</div>;
}
