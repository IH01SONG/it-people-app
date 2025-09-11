/**
 * 개발용 목 데이터
 * 서버 연동 없이 UI 개발/테스트를 위한 가상 데이터
 */

// 사용자 목 데이터
export const mockUsers = [
  {
    id: "user1",
    nickname: "김개발",
    email: "dev@example.com",
    name: "김개발",
    birthDate: "1990-01-15",
    profileImageUrl: "https://picsum.photos/150/150?random=1",
    notificationSettings: {
      joinRequests: true,
      newMessages: true,
      postUpdates: true,
      meetingReminders: true,
      systemNotifications: false,
    }
  },
  {
    id: "user2",
    nickname: "박프론트",
    email: "frontend@example.com",
    name: "박프론트",
    profileImageUrl: "https://picsum.photos/150/150?random=2",
  },
  {
    id: "user3",
    nickname: "이백엔드",
    email: "backend@example.com",
    name: "이백엔드",
    profileImageUrl: "https://picsum.photos/150/150?random=3",
  },
  {
    id: "user4",
    nickname: "정디자인",
    email: "design@example.com",
    name: "정디자인",
    profileImageUrl: "https://picsum.photos/150/150?random=4",
  }
];

// 게시글 목 데이터
export const mockPosts = [
  {
    _id: "post1",
    title: "React 스터디 모임 🚀",
    content: "매주 토요일 오후 2시에 만나서 React를 공부해요! 초보자도 환영합니다.",
    author: mockUsers[0],
    category: "스터디",
    location: "강남구",
    maxParticipants: 6,
    currentParticipants: 3,
    meetingDate: "2024-01-20T14:00:00.000Z",
    isActive: true,
    createdAt: "2024-01-10T10:00:00.000Z",
    tags: ["React", "JavaScript", "프론트엔드"]
  },
  {
    _id: "post2",
    title: "Node.js 백엔드 프로젝트 팀원 모집",
    content: "Express.js와 MongoDB로 REST API 만드는 프로젝트입니다. 경험자 우대!",
    author: mockUsers[2],
    category: "프로젝트",
    location: "서초구",
    maxParticipants: 4,
    currentParticipants: 2,
    meetingDate: "2024-01-25T19:00:00.000Z",
    isActive: true,
    createdAt: "2024-01-12T15:30:00.000Z",
    tags: ["Node.js", "Express", "MongoDB"]
  },
  {
    _id: "post3",
    title: "UI/UX 디자인 카페 모임 ☕",
    content: "디자인 트렌드 공유하고 포트폴리오 피드백 받아요!",
    author: mockUsers[3],
    category: "네트워킹",
    location: "홍대입구",
    maxParticipants: 8,
    currentParticipants: 8,
    meetingDate: "2024-01-15T16:00:00.000Z",
    isActive: false,
    createdAt: "2024-01-05T11:20:00.000Z",
    tags: ["UI", "UX", "디자인", "피그마"]
  }
];

// 채팅방 목 데이터
export const mockChatRooms = [
  {
    _id: "room1",
    type: "post" as const,
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      _id: "msg_last1",
      content: "내일 모임 참석 가능하세요?",
      createdAt: "2024-01-15T14:30:00.000Z",
    },
    postId: {
      _id: "post1",
      title: "React 스터디 모임 🚀",
      content: "매주 토요일 오후 2시에 만나서 React를 공부해요!"
    },
    lastActivity: "2024-01-15T14:30:00.000Z",
    isActive: true
  },
  {
    _id: "room2",
    type: "post" as const,
    participants: [mockUsers[0], mockUsers[2]],
    lastMessage: {
      _id: "msg_last2",
      content: "좋은 프로젝트네요! 참여하고 싶습니다",
      createdAt: "2024-01-14T20:15:00.000Z",
    },
    postId: {
      _id: "post2",
      title: "Node.js 백엔드 프로젝트 팀원 모집",
      content: "Express.js와 MongoDB로 REST API 만드는 프로젝트입니다."
    },
    lastActivity: "2024-01-14T20:15:00.000Z",
    isActive: true
  },
  {
    _id: "room3",
    type: "post" as const,
    participants: [mockUsers[0], mockUsers[3]],
    lastMessage: {
      _id: "msg_last3",
      content: "모임이 정말 유익했어요! 감사합니다 😊",
      createdAt: "2024-01-10T18:45:00.000Z",
    },
    postId: {
      _id: "post3",
      title: "UI/UX 디자인 카페 모임 ☕",
      content: "디자인 트렌드 공유하고 포트폴리오 피드백 받아요!"
    },
    lastActivity: "2024-01-10T18:45:00.000Z",
    isActive: false
  }
];

// 채팅 메시지 목 데이터
export const mockMessages: { [roomId: string]: any[] } = {
  room1: [
    {
      _id: "msg1_1",
      content: "안녕하세요! React 스터디에 관심이 많아서 연락드려요",
      type: "text",
      sender: mockUsers[1],
      createdAt: "2024-01-14T10:00:00.000Z",
      isMe: false
    },
    {
      _id: "msg1_2",
      content: "안녕하세요! 환영합니다 😊 React 경험이 어느 정도 되시나요?",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-14T10:05:00.000Z",
      isMe: true
    },
    {
      _id: "msg1_3",
      content: "기초적인 컴포넌트 정도는 만들 수 있어요. 훅은 아직 어려워해서 공부하고 싶습니다!",
      type: "text",
      sender: mockUsers[1],
      createdAt: "2024-01-14T10:10:00.000Z",
      isMe: false
    },
    {
      _id: "msg1_4",
      content: "완벽해요! 저희가 이번 주에 훅 위주로 스터디할 예정이거든요",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-14T10:12:00.000Z",
      isMe: true
    },
    {
      _id: "msg1_5",
      content: "이미지를 공유했습니다",
      type: "file",
      fileUrl: "https://picsum.photos/300/200?random=101",
      fileName: "react_hook_guide.jpg",
      sender: mockUsers[0],
      createdAt: "2024-01-14T10:15:00.000Z",
      isMe: true
    },
    {
      _id: "msg1_6",
      content: "내일 모임 참석 가능하세요?",
      type: "text",
      sender: mockUsers[1],
      createdAt: "2024-01-15T14:30:00.000Z",
      isMe: false
    }
  ],
  room2: [
    {
      _id: "msg2_1",
      content: "Node.js 프로젝트에 관심이 있어서 연락드립니다!",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-13T19:00:00.000Z",
      isMe: true
    },
    {
      _id: "msg2_2",
      content: "안녕하세요! Node.js 경험은 어느 정도 되시나요?",
      type: "text",
      sender: mockUsers[2],
      createdAt: "2024-01-13T19:05:00.000Z",
      isMe: false
    },
    {
      _id: "msg2_3",
      content: "Express로 간단한 API 서버 정도는 만들어봤어요. MongoDB는 처음이라 배우고 싶습니다",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-13T19:08:00.000Z",
      isMe: true
    },
    {
      _id: "msg2_4",
      content: "좋은 프로젝트네요! 참여하고 싶습니다",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-14T20:15:00.000Z",
      isMe: true
    }
  ],
  room3: [
    {
      _id: "msg3_1",
      content: "디자인 모임 참석하고 싶어서 연락드려요!",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-08T14:00:00.000Z",
      isMe: true
    },
    {
      _id: "msg3_2",
      content: "환영합니다! 어떤 디자인 툴을 주로 사용하시나요?",
      type: "text",
      sender: mockUsers[3],
      createdAt: "2024-01-08T14:05:00.000Z",
      isMe: false
    },
    {
      _id: "msg3_3",
      content: "Figma를 주로 사용해요. 최근에 프로토타이핑 기능을 배우고 있습니다",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-08T14:10:00.000Z",
      isMe: true
    },
    {
      _id: "msg3_4",
      content: "모임이 정말 유익했어요! 감사합니다 😊",
      type: "text",
      sender: mockUsers[0],
      createdAt: "2024-01-10T18:45:00.000Z",
      isMe: true
    }
  ]
};

// 현재 로그인 사용자 (개발용)
export const mockCurrentUser = mockUsers[0];