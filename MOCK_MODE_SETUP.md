# 🔧 Mock 모드 설정 완료

**상태:** ✅ 백엔드 없이 로컬 Mock 데이터로 테스트 가능

---

## 📋 적용된 변경사항

### 1. **전역 설정** (`themeConfig.js`)
```javascript
onlyMockup: true,        // Mock 데이터만 사용 (실제 API 호출 안 함)
useRestfulAPI: false,    // REST API 비활성화
showDetailLog: true,     // 상세 로그 활성화
```

### 2. **Vite 프록시 비활성화** (`vite.config.js`)
- 모든 API 프록시 설정 주석 처리
- 로컬 Mock 데이터만 사용

### 3. **Mock 데이터 구조** (`src/api/mock/`)
```
├── modules.json     # 유량계 목록
├── events.json      # 이벤트 발생 현황
└── flowData.json    # 시간별 유량 데이터
```

### 4. **API 모듈 수정** (`src/api/`)
각 API 함수에서 `isUseAPI()` 조건 분기:
- ✅ `isUseAPI() = true` → 실제 백엔드 API 호출
- ✅ `isUseAPI() = false` → Mock JSON 반환 (지금 상태)

#### 수정된 파일
- `module.js` - 장비 목록
- `event.js` - 이벤트 조회
- `flow.js` - 유량 데이터
- `tankVolume.js` - 탱크 볼륨

### 5. **에러 처리 개선** (`dashboard.vue`)
- API 실패 시 경고만 로깅, 페이지 계속 표시
- Mock 모드에서 alert 제거

---

## 🎯 테스트 방법

### 1단계: 서버 시작
```bash
npm run dev
```

### 2단계: 로그인
- **ID:** admin (또는 mock 데이터에 정의된 계정)
- **Password:** 아무거나

### 3단계: 대시보드 확인
```
http://localhost:5173/#/dashboard
```

### 4단계: 콘솔에서 Mock 상태 확인
```javascript
// 브라우저 F12 → Console
__DEBUG__.fullDiagnosis()

// 출력 예시
📌 Token: admin...
📌 API 설정: { VITE_HIWAY_API_URL: '/hiway', VITE_API_BASE_URL: '/tankmonitoring' }
```

---

## 📊 Mock 데이터 샘플

### 장비 목록 (`modules.json`)
```json
{
  "module_idx": 1,
  "module_name": "유량계_A",
  "ship_no": "선박001",
  "tank_name": "탱크_1",
  "del_flag": 0
}
```

### 이벤트 (`events.json`)
```json
{
  "event_id": 1,
  "event_type": "1",
  "string_kr": "주수 시작",
  "rgst_dt": "2026-01-18 10:00:00",
  "status": "normal"
}
```

### 유량 데이터 (`flowData.json`)
```json
{
  "timestamp": "2026-01-18T09:00:00Z",
  "accumulated": 15.2,
  "hourly_flow": 3.8
}
```

---

## 🔄 백엔드 복구 시 전환

백엔드 서버가 준비되면 다시 실제 API 호출로 전환:

### `themeConfig.js` 수정
```javascript
onlyMockup: false,       // ← true에서 false로 변경
useRestfulAPI: true,     // ← false에서 true로 변경
```

### `vite.config.js` 수정
```javascript
server: {
  proxy: {
    '/hiway': 'http://172.17.10.68',
    '/api': { target: 'http://localhost:8144', ... }
  }
}
```

---

## 🚀 현재 가능한 기능

✅ 로그인 (Mock 계정)
✅ 대시보드 데이터 조회
✅ 탱크 상태 모니터링
✅ 이벤트 목록 표시
✅ 유량 그래프 (Mock 데이터)
✅ 통신 상태 표시

---

## ⚠️ 주의사항

1. **Mock 데이터는 정적**
   - 실시간 업데이트 없음
   - 디자인 검증 목적만

2. **네트워크 지연 시뮬레이션**
   - 각 API 호출에 300ms 지연 추가
   - 실제 사용자 경험과 유사하게 구성

3. **로그인 유지**
   - SessionStorage 사용
   - 페이지 새로고침 유지됨

---

## 📝 디버깅

### 콘솔 명령어
```javascript
// 전체 진단
__DEBUG__.fullDiagnosis()

// 개별 확인
__DEBUG__.checkToken()         // 로그인 토큰
__DEBUG__.checkAPI()           // API 엔드포인트
__DEBUG__.checkLocalStorage()  // 로컬 스토리지
```

### 로그 확인
```
Console 탭: 
✅ [REQUEST] 토큰 포함 - 정상
⚠️ [REQUEST] 토큰 없음 - 에러
```

---

**이제 백엔드 없이도 UI 디자인 테스트를 진행할 수 있습니다! 🎉**
