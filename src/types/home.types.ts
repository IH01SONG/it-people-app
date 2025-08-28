/**
 * 모임 게시글 데이터 타입 (백엔드 Post 모델과 일치)
 */
export interface Post {
  id: string; // 게시글 고유 ID
  title: string; // 게시글 제목
  content: string; // 게시글 내용
  author: string; // 작성자 이름
  authorId: string; // 작성자 ID
  location: {
    type: 'Point';
    coordinates: [number, number]; // [경도, 위도] GeoJSON 형식
    address?: string; // 주소 (표시용)
  }; // 위치 정보 (GeoJSON Point)
  venue?: string; // 구체적인 만날 장소
  category: string; // 모임 카테고리
  tags: string[]; // 태그 배열
  image?: string; // 게시글 이미지 URL
  participants: string[]; // 참여자 ID 배열
  maxParticipants: number; // 최대 참여자 수
  meetingDate?: Date; // 모임 일시
  status: 'active' | 'full' | 'completed' | 'cancelled'; // 모임 상태
  chatRoom?: string; // 채팅방 ID
  viewCount: number; // 조회수
  createdAt: string; // 생성 일시
  updatedAt: string; // 수정 일시
  isLiked?: boolean; // 사용자 좋아요 여부 (클라이언트에서 추가)
}

/**
 * 알림 데이터 타입 (백엔드 Notification 모델과 일치)
 */
export interface Notification {
  id: string; // 알림 고유 ID
  userId: string; // 알림 받을 사용자 ID
  type: 'join_request' | 'request_accepted' | 'request_rejected' | 'post_full' | 'post_reminder' | 'chat_message' | 'post_cancelled' | 'system'; // 알림 타입
  title: string; // 알림 제목
  message: string; // 알림 메시지
  data?: {
    postId?: string;
    requestId?: string;
    chatRoomId?: string;
    [key: string]: any;
  }; // 추가 데이터
  read: boolean; // 읽음 여부
  createdAt: string; // 생성 일시
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