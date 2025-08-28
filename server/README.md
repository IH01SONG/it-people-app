# IT People App - Backend API Server

Node.js/Express 기반의 모임 앱 백엔드 API 서버입니다.

## 🚀 주요 기능

- **JWT 기반 인증/인가 시스템**
- **역할 기반 접근 제어 (RBAC)**
- **소유권 기반 리소스 보호**
- **요청 제한 (Rate Limiting)**
- **입력 값 검증 (Validation)**
- **완전한 에러 핸들링**
- **RESTful API 설계**

## 📁 프로젝트 구조

```
server/
├── controllers/          # 비즈니스 로직
│   ├── authController.js     # 인증 관련
│   ├── postsController.js    # 게시글 관련
│   ├── usersController.js    # 사용자 관련
│   └── requestsController.js # 참여 요청 관련
├── routes/               # 라우트 정의
│   ├── auth.js              # 인증 라우트
│   ├── posts.js             # 게시글 라우트
│   ├── users.js             # 사용자 라우트
│   └── requests.js          # 참여 요청 라우트
├── middleware/           # 미들웨어
│   ├── authMiddleware.js    # JWT 인증, 권한 관리
│   └── validation.js        # 입력 검증
├── models/               # 데이터베이스 모델 (미구현)
├── utils/                # 유틸리티 함수들
├── app.js                # 메인 서버 파일
├── package.json          # 프로젝트 설정
└── .env.example          # 환경 변수 예시
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 수정하여 필요한 환경 변수를 설정하세요:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/it-people-app
JWT_SECRET=your-very-secure-jwt-secret-key-here
```

### 3. 서버 실행

```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

서버가 실행되면 `http://localhost:3001`에서 접근할 수 있습니다.

## 📚 API 문서

### 인증 API (`/api/auth`)

| Method | Endpoint | 설명 | 인증 | Rate Limit |
|--------|----------|------|------|------------|
| POST | `/signup` | 회원가입 | ❌ | 5/hour |
| POST | `/login` | 로그인 | ❌ | 10/15min |
| GET | `/me` | 내 정보 조회 | ✅ | - |

### 게시글 API (`/api/posts`)

| Method | Endpoint | 설명 | 인증 | Rate Limit |
|--------|----------|------|------|------------|
| GET | `/` | 게시글 목록 | 선택적 | - |
| GET | `/nearby` | 주변 게시글 | 선택적 | - |
| GET | `/:postId` | 게시글 상세 | 선택적 | - |
| POST | `/` | 게시글 작성 | ✅ | 5/hour |
| PUT | `/:postId` | 게시글 수정 | ✅ (소유자) | - |
| DELETE | `/:postId` | 게시글 삭제 | ✅ (소유자) | - |
| POST | `/:postId/join` | 모임 참여 | ✅ | 10/min |
| DELETE | `/:postId/leave` | 모임 나가기 | ✅ | - |

### 사용자 API (`/api/users`)

| Method | Endpoint | 설명 | 인증 | Rate Limit |
|--------|----------|------|------|------------|
| GET | `/me` | 내 프로필 | ✅ | - |
| PUT | `/me` | 프로필 수정 | ✅ | 10/hour |
| GET | `/me/posts` | 내가 쓴 글 | ✅ | - |
| GET | `/me/joined-posts` | 참여한 모임 | ✅ | - |
| POST | `/block/:userId` | 사용자 차단 | ✅ | 20/day |
| DELETE | `/block/:userId` | 차단 해제 | ✅ | - |

### 참여 요청 API (`/api/join-requests`)

| Method | Endpoint | 설명 | 인증 | Rate Limit |
|--------|----------|------|------|------------|
| POST | `/posts/:postId/request-join` | 참여 요청 | ✅ | 20/hour |
| POST | `/:requestId/accept` | 요청 수락 | ✅ (게시글 소유자) | - |
| POST | `/:requestId/reject` | 요청 거절 | ✅ (게시글 소유자) | - |
| GET | `/my-requests` | 내 요청 목록 | ✅ | - |
| GET | `/received` | 받은 요청 목록 | ✅ | - |

## 🔒 인증 및 권한

### JWT 토큰 사용

```bash
# 헤더에 토큰 포함
Authorization: Bearer <your-jwt-token>
```

### 미들웨어 종류

1. **`auth`** - 필수 인증 (토큰 필요)
2. **`optionalAuth`** - 선택적 인증 (토큰 있으면 추가 정보 제공)
3. **`requireRole(['admin'])`** - 역할 기반 접근 제어
4. **`requireOwnership(getResourceOwnerId)`** - 소유권 확인
5. **`rateLimit(requests, windowMs)`** - 요청 제한

### 에러 코드

| 코드 | 설명 |
|------|------|
| `TOKEN_MISSING` | 토큰이 없음 |
| `TOKEN_EXPIRED` | 토큰 만료 |
| `TOKEN_INVALID` | 잘못된 토큰 |
| `USER_NOT_FOUND` | 사용자 없음 |
| `ACCOUNT_INACTIVE` | 비활성 계정 |
| `ACCOUNT_BANNED` | 차단된 계정 |
| `INSUFFICIENT_PERMISSIONS` | 권한 부족 |
| `RESOURCE_ACCESS_DENIED` | 리소스 접근 거부 |
| `RATE_LIMIT_EXCEEDED` | 요청 한도 초과 |
| `VALIDATION_ERROR` | 입력 값 오류 |

## 🔍 입력 검증

모든 API 엔드포인트는 입력 값 검증을 수행합니다:

### 회원가입 검증
- **이메일**: 유효한 이메일 형식, 5-100자
- **비밀번호**: 6-50자, 소문자+숫자 포함 필수
- **닉네임**: 2-20자, 한글/영문/숫자/특수문자(_-) 허용

### 게시글 작성 검증
- **제목**: 5-100자
- **내용**: 10-2000자
- **카테고리**: 정의된 카테고리만 허용
- **최대 참여자**: 2-50명
- **위치**: GeoJSON Point 형식
- **모임 날짜**: 현재 시간 이후만 허용

## 🚦 Rate Limiting

API별로 다른 제한이 적용됩니다:

- **회원가입**: 5회/시간
- **로그인**: 10회/15분
- **게시글 작성**: 5회/시간
- **모임 참여**: 10회/분
- **참여 요청**: 20회/시간
- **프로필 수정**: 10회/시간
- **사용자 차단**: 20회/일

## 📝 요청/응답 예시

### 회원가입

**요청:**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67123456789abcdef0123456",
      "email": "user@example.com",
      "nickname": "홍길동",
      "profileImageUrl": null
    }
  },
  "message": "회원가입이 성공적으로 완료되었습니다."
}
```

### 게시글 작성

**요청:**
```bash
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "홍대에서 저녁 같이 드실 분!",
  "content": "맛있는 한식당에서 저녁 같이 드셔요. 혼밥은 이제 그만!",
  "location": {
    "type": "Point",
    "coordinates": [126.9235, 37.5502],
    "address": "홍대입구 근처"
  },
  "venue": "홍대 한식당",
  "category": "식사",
  "tags": ["혼밥탈출", "새친구"],
  "maxParticipants": 4,
  "meetingDate": "2024-03-15T19:00:00.000Z"
}
```

## 🔧 개발 환경

- **Node.js**: >= 14.0.0
- **MongoDB**: >= 4.4.0
- **Express**: ^4.18.2
- **Mongoose**: ^7.5.0
- **JWT**: ^9.0.2

## 🧪 테스트

```bash
npm test
```

## 📈 모니터링

프로덕션 환경에서는 다음을 고려하세요:

- **로그 관리**: Winston 등의 로깅 라이브러리
- **모니터링**: PM2, New Relic 등
- **보안**: Helmet.js, 환경 변수 암호화
- **성능**: Redis를 활용한 Rate Limiting
- **데이터베이스**: MongoDB Atlas 클러스터링

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이센스

This project is licensed under the MIT License.