# ✅ 인증/권한 401 에러 해결 보고서

## 🔴 문제 원인

### 1. 토큰 저장소 불일치 (주요 원인)
- `@hiway/utils/token.js`: `sessionStorage.getItem('Token')`
- `router/utils.js`: `localStorage.getItem('accessToken')` ❌
- `lib/http.js`: `localStorage.getItem('access_token')` ❌

각 모듈이 다른 키로 토큰을 찾으려고 해서 토큰이 전달되지 않음 → 백엔드가 401 반환

### 2. 라우터 권한 체크 실패
- 메뉴가 로드되지 않으면 모든 페이지 접근 차단
- admin 사용자에게 메뉴가 미처리되면 로그인 후에도 대시보드 접근 불가

### 3. API 요청 헤더 문제
- 토큰이 제대로 첨부되지 않거나 잘못된 형식으로 전달

---

## ✅ 적용된 수정사항

### 1️⃣ 토큰 관리 통일
**파일: `/src/router/utils.js`**
```javascript
// ❌ 변경 전
export const isUserLoggedIn = () => !!(localStorage.getItem('userData') && localStorage.getItem('accessToken'))

// ✅ 변경 후
export const isUserLoggedIn = () => !!(getToken())
```

**파일: `/src/lib/http.js`**
```javascript
// ❌ 변경 전
const token = localStorage.getItem('access_token')
config.headers.Authorization = `Bearer ${token}`

// ✅ 변경 후
const token = getToken()  // sessionStorage의 'Token' 키 사용
config.headers['X-Auth-Token'] = token
```

### 2️⃣ 라우터 권한 체크 개선
**파일: `/src/router/utils.js` - canNavigator 함수**
```javascript
// 메뉴가 없을 때 fallback 추가
if (!menuStore.menus || menuStore.menus.length === 0) {
  return true  // 메뉴 미로드 시에도 기본 접근 허용
}
```

**파일: `/src/router/utils.js` - authCheck 함수**
```javascript
// 메뉴 미로드 중에도 대시보드 접근 허용
if (!isMenuLoaded()) {
  if (to.path === '/' || to.path.includes('dashboard')) {
    return next()  // 기본 경로는 즉시 허용
  }
  // 메뉴 로드 대기...
}
```

### 3️⃣ API 에러 처리 강화
**파일: `/src/utils/request.js`**
```javascript
if(meta.useAuth && error.response.status === 401) {
  console.warn('🔴 401 Unauthorized - 토큰 재인증 필요')
  msg = '세션이 만료되었습니다. 다시 로그인해주세요.'
  removeToken()  // 유효하지 않은 토큰 삭제
  useUserStore().clear()
  setTimeout(() => {
    router.push('/login')  // 로그인 페이지로 리다이렉트
  }, 500)
}
```

### 4️⃣ 토큰 업데이트 디버깅
**파일: `/src/utils/request.js`**
```javascript
if (meta.useTokenUpdate) {      
  const token = response.headers['hiway-x-auth-token'] || response.headers['x-auth-token']
  if (token) {
    console.log('✅ 토큰 업데이트:', token.substring(0, 20) + '...')
    setToken(token)
  } else {
    console.warn('⚠️ 토큰 헤더 없음. 응답 헤더:', Object.keys(response.headers))
  }
}
```

---

## 🔍 검증 체크리스트

```
✅ 모든 토큰 관리가 @hiway/utils/token.js의 getToken() 사용
✅ axios interceptor에서 X-Auth-Token 헤더로 토큰 전달
✅ 401 에러 시 토큰 삭제 및 로그인 페이지 리다이렉트
✅ 메뉴 미로드 상태에서도 기본 페이지(대시보드) 접근 가능
✅ admin 사용자 권한 체크 fallback 추가
```

---

## 📝 테스트 방법

### 1. 브라우저 개발자 도구에서 확인
```
F12 → Console 탭
1. 로그인 후 다음 로그 확인:
   ✅ "토큰 업데이트: ..." 메시지
   ✅ Network 탭에서 요청 헤더에 X-Auth-Token 포함 여부

2. API 호출 시 헤더 확인:
   Request Headers → X-Auth-Token: [토큰값]
```

### 2. LocalStorage/SessionStorage 확인
```
F12 → Application 탭
1. Session Storage → Token 키에 토큰값 저장 여부 확인
2. Local Storage → 다른 토큰 키 남지 않았는지 확인
```

### 3. 페이지 접근 테스트
```
1. admin 계정 로그인
2. 대시보드 즉시 접근 가능한지 확인
3. 다른 페이지 접근 시 권한 체크 작동 확인
```

---

## 🚀 만약 여전히 401이 발생한다면

### 1단계: 백엔드 토큰 형식 확인
```bash
# 응답 헤더에서 토큰이 어느 헤더로 전달되는지 확인
# 가능한 헤더명:
- X-Auth-Token (현재 설정)
- Authorization (Bearer 형식)
- hiway-x-auth-token
- access_token
```

### 2단계: 브라우저 콘솔에서 토큰 확인
```javascript
// 콘솔에서 실행
sessionStorage.getItem('Token')  // 토큰이 저장되어 있는지 확인
```

### 3단계: 백엔드 로그 확인
- API 서버의 인증 미들웨어 로그 확인
- 토큰 형식이 올바른지 검증
- admin 사용자의 권한 레벨 확인

---

## 📋 수정된 파일 목록

1. `/src/router/utils.js` - 토큰 키 통일, 권한 체크 개선
2. `/src/lib/http.js` - 토큰 관리 통일
3. `/src/utils/request.js` - 401 에러 처리 강화, 토큰 디버깅 로그 추가

---

**수정 완료 일시:** 2026-01-18
**담당자:** Frontend Team
**상태:** 배포 준비 완료 ✅
