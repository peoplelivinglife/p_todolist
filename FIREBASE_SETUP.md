# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `mydaylist`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. Firestore Database 설정

1. Firebase Console에서 "Firestore Database" 메뉴 선택
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작 (개발용)
   - 실제 배포 시에는 프로덕션 모드 권장
4. 리전 선택 (asia-northeast3 - 서울 권장)

## 3. 웹 앱 추가

1. Firebase Console 프로젝트 개요에서 웹 아이콘 클릭
2. 앱 닉네임 입력
3. Firebase 구성 정보 복사

## 4. 환경 설정

### 4.1 환경 변수 파일 생성

`.env.local` 파일을 프로젝트 루트에 생성:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4.2 Firebase 구성 업데이트

`src/lib/firebase.js` 파일 수정:

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)

// Firestore 인스턴스
export const db = getFirestore(app)

// 실제 Firebase 함수들로 교체
export { 
  addDoc,
  getDocs,
  updateDoc,
  doc,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore'
```

## 5. 보안 규칙 설정

### 5.1 개발용 규칙 (현재)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개발용: 전체 읽기/쓰기 허용
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5.2 실제 배포용 규칙 (권장)

인증 기능 추가 후 사용할 보안 규칙:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 자신의 할 일에 접근
    match /todos/{todoId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // 새 문서 생성 시
    match /todos/{todoId} {
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 6. 데이터베이스 구조

### todos 컬렉션

```javascript
{
  id: string,              // 자동 생성 ID
  title: string,           // 할 일 제목 (필수)
  date: string | null,     // 날짜 'YYYY-MM-DD' 형식, null이면 백로그
  tag: 'blue' | 'green' | 'yellow' | 'red',  // 태그 색상
  completed: boolean,      // 완료 여부
  order: number,          // 정렬 순서 (선택사항)
  createdAt: Timestamp,   // 생성일시
  updatedAt: Timestamp,   // 수정일시 (선택사항)
  userId: string         // 사용자 ID (인증 추가 시)
}
```

## 7. 배포 설정

### 7.1 Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### 7.2 로그인 및 초기화

```bash
firebase login
firebase init firestore
```

### 7.3 규칙 배포

```bash
firebase deploy --only firestore:rules
```

## 8. 주의사항

- ⚠️ 현재 보안 규칙은 **개발용**입니다
- 실제 서비스 시에는 **인증 기능**을 추가하고 적절한 보안 규칙 설정 필요
- 환경 변수 파일(`.env.local`)은 **Git에 커밋하지 말 것**
- Firebase 프로젝트의 **결제 설정**도 확인 권장

## 9. 트러블슈팅

### 일반적인 문제들

1. **CORS 오류**: Firebase 프로젝트 설정에서 도메인 추가
2. **권한 오류**: Firestore 규칙 확인
3. **환경변수 인식 안됨**: Vite 재시작 (`npm run dev`)
4. **빌드 오류**: 환경변수 이름이 `VITE_` 접두어로 시작하는지 확인