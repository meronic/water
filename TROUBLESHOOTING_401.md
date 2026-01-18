# 401 에러 해결 가이드

## 🔴 문제 상황
Admin 계정으로 로그인했는데 모든 페이지에서 401 에러 발생

---

## 📋 진단 절차

### 1단계: 개발자 도구 열기
```
F12 또는 Ctrl+Shift+I → Console 탭
```

### 2단계: 전체 진단 실행
```javascript
__DEBUG__.fullDiagnosis()
```

**예상 출력:**
```
📌 Token: abc123def456...    // ✅ Token 있어야 함
📌 LocalStorage: { userData: null, accessToken: null, access_token: null }  // ❌ 사용하지 않음
📌 SessionStorage: { Token: 'EXISTS' }  // ✅ 있어야 함
📌 API 설정: { VITE_HIWAY_API_URL: '/hiway', VITE_API_BASE_URL: '/tankmonitoring' }
```

---

## 🔍 원인별 진단 & 해결

### 원인 1️⃣: 토큰이 저장되지 않음
```javascript
__DEBUG__.checkToken()  // "NONE" 출력
```

**해결:**
1. 로그인 페이지에서 관리자 계정으로 다시 로그인
2. 콘솔에서 `__DEBUG__.checkToken()` 재실행
3. 여전히 NONE이면 → **백엔드 로그인 API 응답 확인**

#### 📡 로그인 API 요청 확인
Console에서:
```javascript
// 요청 헤더 확인
__DEBUG__.checkAPI()

// 네트워크 탭에서 login 요청 확인
// - Status: 200 OK
// - Response 헤더에 x-auth-token 또는 hiway-x-auth-token 포함?
```

---

### 원인 2️⃣: 토큰은 있는데 API 요청에 포함 안 됨
```javascript
__DEBUG__.checkToken()  // Token 있음 (정상)
// → 하지만 Network 탭에서 요청 헤더에 X-Auth-Token 없음
```

**해결:**
1. 캐시 초기화 및 페이지 새로고침: `Ctrl+Shift+R`
2. 로그인 다시 진행

---

### 원인 3️⃣: 토큰은 있고 헤더도 포함되는데 401
```javascript
__DEBUG__.checkToken()  // Token 있음
// → Network 탭: X-Auth-Token 헤더 있음
// → 하지만 API 응답: 401 Unauthorized
```

**이 경우 이유:**
- ❌ 백엔드 API 서버가 다운되었거나
- ❌ 백엔드가 토큰 형식을 인식 못하거나 (예: Bearer vs 직접 토큰)
- ❌ 백엔드 권한 설정 오류

**확인:**
```bash
# 백엔드 API 서버 상태 확인
curl -X GET http://[API_SERVER]/hiway/login/user \
  -H "X-Auth-Token: [YOUR_TOKEN]"

# 응답이 200이면 → 프론트엔드 이슈
# 응답이 401이면 → 백엔드 인증 이슈
```

---

## 🔧 Network 탭 확인 방법

### 로그인 후 대시보드 접근 시
1. **F12 → Network 탭**
2. **모든 요청 확인**

#### ✅ 정상 흐름
```
1️⃣  /hiway/login          → 200 OK
    Response Headers: x-auth-token: abc123...
    
2️⃣  /hiway/login/user     → 200 OK
    Request Headers: X-Auth-Token: abc123...
    
3️⃣  /hiway/login/menus    → 200 OK
    Request Headers: X-Auth-Token: abc123...
    
4️⃣  /tankmonitoring/...   → 200 OK (Dashboard API)
```

#### ❌ 에러 흐름
```
1️⃣  /hiway/login          → 200 OK ✅
2️⃣  /hiway/login/user     → 401 Unauthorized ❌
    → 토큰 저장 안 됨 또는 백엔드 서버 이슈
```

---

## 📊 상태 체크리스트

| 확인 항목 | 정상 | 확인 방법 |
|---------|------|---------|
| 로그인 가능 | ✅ | 로그인 성공 메시지 |
| 토큰 저장 | ✅ | `__DEBUG__.checkToken()` → Token 있음 |
| 토큰 전달 | ✅ | Network 탭 → X-Auth-Token 헤더 |
| 백엔드 응답 | ✅ | Network 탭 → 200 OK |
| 대시보드 접근 | ✅ | 페이지 정상 로드 |

---

## 🚨 가장 흔한 원인

### ⚠️ `onlyMockup: true` 설정
**파일:** `themeConfig.js`
```javascript
onlyMockup: true,  // ← 이것이 true면 Mock 데이터만 사용!
```

**해결:**
```javascript
onlyMockup: false,  // 실제 API 사용
```

---

## 🆘 여전히 해결 안 되면

콘솔 출력 결과를 다음과 함께 보고:

```javascript
// 전체 출력 복사
copy(__DEBUG__.fullDiagnosis())

// Network 탭 스크린샷
// (로그인 후 첫 5개 요청)

// 콘솔 에러 메시지 전체
// (Console 탭에서 빨간 에러 메시지)
```

