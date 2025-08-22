/**
 * 모임 게시글 데이터 타입
 */
export interface Post {
  id: string; // 게시글 고유 ID
  title: string; // 게시글 제목
  content: string; // 게시글 내용
  author: string; // 작성자 이름
  location: string; // 모임 지역
  venue: string; // 모임 장소
  category: string; // 모임 카테고리
  image: string | null; // 게시글 이미지 URL
  participants: number; // 현재 참여자 수
  maxParticipants: number; // 최대 참여자 수
  createdAt: string; // 생성 일시
  expiresAt?: number; // 만료 일시 (timestamp)
  isLiked: boolean; // 사용자 좋아요 여부
  isActive?: boolean; // 모임 활성 상태
}

/**
 * 알림 데이터 타입
 */
export interface Notification {
  id: number; // 알림 고유 ID
  title: string; // 알림 제목
  content: string; // 알림 내용
  time: string; // 알림 발생 시간
  read: boolean; // 읽음 여부
  type: string; // 알림 타입
  chatRoomId?: string; // 연결된 채팅방 ID (선택적)
}

/**
 * 내 모임 활동 데이터 타입
 */
export interface Activity {
  id: number; // 활동 고유 ID
  title: string; // 모임 제목
  status: string; // 모임 상태 (참여 중, 대기 중, 모집 완료 등)
  time: string; // 모임 시간
  members: number; // 현재 참여자 수
  maxMembers: number; // 최대 참여자 수
  category: string; // 모임 카테고리
  role: string; // 내 역할 (주최자, 참여자)
  createdAt: string; // 모임 생성 일시
}