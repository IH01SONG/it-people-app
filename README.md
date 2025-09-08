# IT People App - Frontend

React + TypeScript + Vite로 개발된 IT People App의 프론트엔드입니다.

## 🚀 시작하기

### 1. 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 백엔드 서버 URL을 설정하세요:

```env
# 백엔드 서버 URL 설정
VITE_API_URL=http://localhost:3001

# 소켓 서버 URL (필요한 경우)
VITE_SOCKET_URL=http://localhost:3001
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## 🔧 백엔드 연동

이 프론트엔드는 별도의 백엔드 서버와 연동됩니다. 백엔드 팀원과 협의하여 다음 사항을 확인하세요:

- 백엔드 서버 URL
- API 엔드포인트 구조
- 인증 방식 (JWT 토큰 등)
- CORS 설정

## 📁 프로젝트 구조

```
src/
├── auth/           # 인증 관련 컴포넌트
├── components/     # 공통 컴포넌트
├── lib/           # API 및 유틸리티
├── pages/         # 페이지 컴포넌트
├── routes/        # 라우팅 설정
└── types/         # TypeScript 타입 정의
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
