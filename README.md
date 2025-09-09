````markdown
# Team Development Rules

우리 팀이 협업할 때 지켜야 할 기본 규칙을 정리했습니다.  
목표: **충돌을 최소화하고, 모두가 같은 방식으로 개발하기**

---

## 1. 브랜치 전략

- **main**

  - 배포용 브랜치 (항상 안정 상태 유지)
  - 직접 푸시 ❌ (팀장/관리자만 merge)

- **dev**

  - 통합 브랜치 (개발자들이 작업한 기능을 합치는 곳)
  - 모든 기능은 최종적으로 여기로 merge

- **feature 브랜치**
  - 규칙: `feature/기능이름`
  - 예시: `feature/post-write-ui`, `feature/login-api`
  - 항상 `dev` 브랜치에서 새로 따오기

---

## 2. 작업 흐름

1. 작업 시작 전:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/내-기능
   ```
````

2. 기능 개발 → 커밋

   ```bash
   git add .
   git commit -m "Add: 게시글 작성 기능"
   ```

3. 작업 끝나면 원격에 올리기

   ```bash
   git push origin feature/내-기능
   ```

4. GitHub에서 **Pull Request(PR)** 생성 → 리뷰 → `dev`에 merge

---

## 3. 커밋 메시지 규칙

- **형식**: `타입: 설명`
- **예시**

  - `Add: 게시글 작성 API 연결`
  - `Fix: 로그인 토큰 오류 수정`
  - `Update: README 수정`

- **타입 가이드**

  - `Add`: 새 기능 추가
  - `Fix`: 버그 수정
  - `Update`: 코드/문서 수정
  - `Remove`: 불필요 코드 제거

---

## 4. 충돌(Conflict) 해결

- 충돌이 나면:

  1. 에러 메시지 확인
  2. 충돌 표시(`<<<<<<<`, `=======`, `>>>>>>>`)가 있는 파일 열기
  3. 남길 코드만 남기고 마커 삭제
  4. 다시 커밋

- 잘 모르겠으면 **혼자 해결하지 말고 팀원과 같이 보기**

---

## 5. 코드 스타일

- Prettier(자동 포맷터) 사용
- 들여쓰기, 따옴표 등 기본 스타일은 자동화 도구에 맞추기
- 불필요한 콘솔 로그는 올리지 않기

---

## 6. 협업 규칙

- dev는 항상 최신 상태 유지
- main은 손대지 않기
- 작은 단위로 자주 커밋하기
- 하루에 최소 한 번은 `git pull origin dev` 하기

---

💡 **Tip**
문제가 꼬이면 → 내 코드 백업(`git stash`나 복사) → 브랜치 새로 따서 깨끗하게 시작하는 게 더 빠를 수 있음!
