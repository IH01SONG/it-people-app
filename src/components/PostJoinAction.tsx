import { useJoinCancel } from '../hooks/useJoinCancel';
import { useState } from 'react';
import { Button } from '@mui/material';
import { api } from '../lib/api';
import { requestJoin } from '../lib/joinRequest.api'; // 가이드 3번
import logoSvg from '../assets/logo.png';

export function PostJoinAction({ postId, disabled = false, authorId, joinStatus }: {
  postId: string;
  disabled?: boolean;
  authorId?: string;
  joinStatus?: string;
}) {
  const { loading, isPending, apply, cancel } = useJoinCancel(postId);
  const [msg, setMsg] = useState<string | null>(null);

  const onApply = async (e?: React.MouseEvent) => {
    // 가이드 1번: 이벤트 버블링 차단
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[CLICK] requestJoin clicked', { postId });

    // 체크리스트 섹션 5: 권한/상태 가드
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id;

    if (authorId && currentUserId && authorId === currentUserId) {
      console.warn('🧯 [GUARD] 자기 글에는 신청 불가', { authorId, currentUserId });
      setMsg('본인이 작성한 글에는 참여 신청할 수 없습니다.');
      return;
    }

    if (joinStatus === 'pending') {
      console.warn('🧯 [GUARD] 이미 pending 상태', { joinStatus });
      setMsg('이미 참여 신청이 진행 중입니다.');
      return;
    }

    setMsg(null);
    try {
      await apply();
      setMsg('참여 신청이 접수되었습니다.');

      // 참여 신청 알림 생성 시도
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id) {
          console.log('📢 참여 신청 알림 생성 중...');
          await api.notifications.createJoinRequestNotification(postId, currentUser.id);
          console.log('✅ 참여 신청 알림 생성 완료');
        }
      } catch (notificationError) {
        console.log('⚠️ 알림 생성 실패 (참여 신청은 성공):', notificationError);
        // 알림 생성 실패는 참여 신청 성공에 영향을 주지 않음
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message;
      let userMessage = '신청에 실패했습니다.';

      // 서버 에러 메시지를 사용자 친화적으로 변환
      if (errorMessage) {
        switch (errorMessage) {
          case '이미 참여 요청을 보냈습니다.':
            userMessage = '이미 참여 신청을 하셨습니다. 🤔';
            // 중복 에러 시 상태 동기화
            try {
              console.log('🔄 [동기화] 기존 요청 상태 조회 중...');
              const sentList = await api.joinRequests.getSent({ status: 'all' });
              const existingRequest = sentList?.data?.requests?.find((req: any) =>
                req?.post?._id === postId || req?.postId === postId
              );
              if (existingRequest) {
                console.log('✅ [동기화] 기존 요청 발견:', existingRequest);
                localStorage.setItem(`join_request_id:${postId}`, existingRequest._id);
                // 상태에 따른 메시지 업데이트
                if (existingRequest.status === 'pending') {
                  userMessage = '이미 참여 신청 중입니다. 취소가 가능해요. 🔄';
                } else if (existingRequest.status === 'approved') {
                  userMessage = '이미 참여 승인되었습니다! 🎉';
                } else if (existingRequest.status === 'rejected') {
                  userMessage = '이전 신청이 거절되었습니다. 😔';
                }
              }
            } catch (syncError) {
              console.warn('⚠️ [동기화] 상태 조회 실패:', syncError);
            }
            break;
          case '자신의 게시글에는 참여 요청할 수 없습니다.':
            userMessage = '본인이 작성한 모임에는 참여할 수 없어요. 😅';
            break;
          case '이미 참여 중인 모임입니다.':
            userMessage = '이미 참여 중인 모임입니다. 취소하려면 내 활동에서 "참여 취소"를 선택하세요. 🎉';
            // 서버가 이미 참가자로 인식 → UI도 참가 상태로 전환
            // TODO: 여기서 상태 업데이트 로직 추가 (useJoinCancel 훅에서 joined 상태로 변경)
            break;
          case '모임 정원이 가득 찼습니다.':
            userMessage = '아쉽게도 모임이 마감되었습니다. 😢';
            break;
          case '모집이 종료된 모임입니다.':
            userMessage = '모집이 종료된 모임입니다. ⏰';
            break;
          default:
            userMessage = errorMessage; // 서버 메시지 그대로 사용
        }
      }

      setMsg(userMessage);

      // 에러 로깅 (개발용)
      console.error('[PostJoinAction] 참여 신청 실패:', {
        originalError: errorMessage,
        userMessage,
        status: e?.response?.status
      });
    }
  };

  const onCancel = async () => {
    setMsg(null);
    try {
      await cancel();
      setMsg('신청을 취소했습니다.');

      // 참여 신청 취소 알림 생성 시도 (모임장에게)
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id) {
          console.log('📢 참여 신청 취소 알림 생성 중...');
          await api.notifications.createJoinRequestCancelledNotification(postId, currentUser.id);
          console.log('✅ 참여 신청 취소 알림 생성 완료');
        }
      } catch (notificationError) {
        console.log('⚠️ 취소 알림 생성 실패 (취소는 성공):', notificationError);
        // 알림 생성 실패는 취소 성공에 영향을 주지 않음
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message;
      const status = e?.response?.status;
      let userMessage = '취소에 실패했습니다.';

      // 서버 에러 메시지를 사용자 친화적으로 변환
      if (errorMessage) {
        userMessage = errorMessage;
      } else {
        // 상태 코드별 기본 메시지
        switch (status) {
          case 400:
            userMessage = '이미 처리된 신청은 취소할 수 없습니다. 🚫';
            break;
          case 403:
            userMessage = '취소 권한이 없습니다. 🔒';
            break;
          case 404:
            userMessage = '신청 정보를 찾을 수 없습니다. 🔍';
            break;
          default:
            userMessage = '취소에 실패했습니다. ❌';
        }
      }

      setMsg(userMessage);

      // 에러 로깅 (개발용)
      console.error('[PostJoinAction] 참여 취소 실패:', {
        originalError: errorMessage,
        userMessage,
        status
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {!isPending ? (
        <Button
          onClick={(e) => onApply(e)}
          disabled={false} // 가이드: 테스트 동안 강제 활성
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
      {msg && (
        <div
          className={`text-xs mt-2 px-3 py-1 rounded-full text-center max-w-xs ${
            msg.includes('성공') || msg.includes('🎉')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : msg.includes('실패') || msg.includes('😢') || msg.includes('⏰') || msg.includes('❌')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : msg.includes('🤔') || msg.includes('😅') || msg.includes('🚫') || msg.includes('🔒') || msg.includes('🔍')
              ? 'bg-orange-50 text-orange-700 border border-orange-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {msg}
        </div>
      )}

      {/* 가이드 7번: 임시 DEBUG 버튼들 */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        <button
          onClick={async () => {
            try {
              console.log('[DEBUG] forcing requestJoin with {}', postId);
              const created = await requestJoin(postId);
              console.log('[DEBUG] direct requestJoin {} =>', created);
            } catch (e) {
              console.error('[DEBUG] create error {}', e);
            }
          }}
          style={{ fontSize: '9px', padding: '2px 4px', background: '#ff0000', color: 'white' }}
        >
          DEBUG: {}
        </button>
        <button
          onClick={async () => {
            try {
              console.log('[DEBUG] forcing requestJoin with message', postId);
              const created = await requestJoin(postId, { message: "테스트 신청" });
              console.log('[DEBUG] direct requestJoin message =>', created);
            } catch (e) {
              console.error('[DEBUG] create error message', e);
            }
          }}
          style={{ fontSize: '9px', padding: '2px 4px', background: '#0000ff', color: 'white' }}
        >
          DEBUG: message
        </button>
        <button
          onClick={async () => {
            // 체크리스트 부록: 서버 독립 검증
            const token = localStorage.getItem('access_token');
            const baseURL = import.meta.env.VITE_API_URL || '/api';
            console.log('[FETCH TEST] 브라우저 fetch로 직접 테스트');
            console.log('[FETCH TEST] Token:', token?.substring(0, 20) + '...');
            console.log('[FETCH TEST] Base URL:', baseURL);

            try {
              const response = await fetch(`${baseURL}/posts/${postId}/request`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: '브라우저 fetch 테스트' })
              });

              const result = await response.json();
              console.log('[FETCH TEST] Response status:', response.status);
              console.log('[FETCH TEST] Response data:', result);

              if (response.ok) {
                console.log('✅ [FETCH TEST] 서버 정상, 프론트 확인 필요');
              } else {
                console.log('❌ [FETCH TEST] 서버 에러:', result);
              }
            } catch (error) {
              console.error('[FETCH TEST] Fetch 에러:', error);
            }
          }}
          style={{ fontSize: '8px', padding: '2px 4px', background: '#00ff00', color: 'black' }}
        >
          FETCH TEST
        </button>
      </div>
    </div>
  );
}