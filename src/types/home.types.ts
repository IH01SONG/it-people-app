// 카테고리 타입 import
import type { Category } from '../utils/category';

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
  category: Category | string; // 모임 카테고리 (populate 또는 ID 문자열)
  tags: string[]; // 태그 배열
  image?: string | string[]; // 게시글 이미지 URL 또는 URL 배열
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
  type: 'join_request' | 'join_request_cancelled' | 'request_accepted' | 'request_rejected' | 'chat_message' | 'chat_room_created' | 'post_full' | 'post_reminder' | 'post_cancelled' | 'system'; // 알림 타입
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
  id: string; // 활동 고유 ID (MongoDB ObjectId)
  title: string; // 모임 제목
  status: string; // 모임 상태 (참여 중, 대기 중, 모집 완료 등)
  time: string; // 모임 시간
  members: number; // 현재 참여자 수
  maxMembers: number; // 최대 참여자 수
  category: Category | string; // 모임 카테고리 (populate 또는 ID 문자열)
  role: string; // 내 역할 (주최자, 참여자)
  createdAt: string; // 모임 생성 일시
  authorId?: string; // 작성자 ID (차단 기능을 위해 추가)
}

/**
 * 채팅방 데이터 타입
 */
export interface ChatRoom {
  id: string; // 채팅방 고유 ID
  postId: string; // 관련 게시글 ID
  postTitle: string; // 게시글 제목
  postCategory: string; // 게시글 카테고리
  postLocation: string; // 게시글 위치
  postImage?: string; // 게시글 이미지
  venue?: string; // 만날 장소
  meetingDate?: string; // 모임 일시
  maxParticipants: number; // 최대 참여자 수
  currentParticipants: number; // 현재 참여자 수
  participants: ChatUser[]; // 참여자 목록
  lastMessage?: ChatMessage; // 마지막 메시지
  unreadCount: number; // 읽지 않은 메시지 수
  status: 'active' | 'completed' | 'blocked'; // 채팅방 상태
  isMyPost: boolean; // 내가 작성한 게시글인지
  createdAt: string; // 생성 일시
  updatedAt: string; // 수정 일시
}

/**
 * 채팅 사용자 데이터 타입
 */
export interface ChatUser {
  id: string; // 사용자 고유 ID
  name: string; // 사용자 이름
  nickname?: string; // 닉네임
  email?: string; // 이메일
  avatar?: string; // 프로필 이미지
  isBlocked?: boolean; // 차단 여부
}

/**
 * 채팅 메시지 데이터 타입
 */
export interface ChatMessage {
  id: string; // 메시지 고유 ID
  roomId: string; // 채팅방 ID
  text: string; // 메시지 내용
  sender: ChatUser; // 발신자 정보
  timestamp: string; // 전송 시간
  isMe: boolean; // 내가 보낸 메시지인지
  readBy: string[]; // 읽은 사용자 ID 목록
  createdAt: string; // 생성 일시
}