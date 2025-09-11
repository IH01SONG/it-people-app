import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NewPost() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // /new 경로에 접근하면 자동으로 /new/step1로 리다이렉트
    navigate('/new/step1', { replace: true });
  }, [navigate]);

  return null;
}