<template>
  <div :class="['settings-wrapper', isDark ? 'dark-mode' : 'light-mode']">
    <div class="settings-header">
      <h2>웹페이지 설정</h2>
      <button 
        class="web-save-button" 
        @click="settingSave" 
        :style="{ backgroundColor: primaryColor }"
      >저장</button>
    </div>

    <table class="web-settings-table">
      <thead>
        <tr>
          <th>구분</th>
          <th>설정명</th>
          <th colspan="2">설정값</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>시스템</td>
          <td>데이터 전송주기</td>
          <td colspan="2">주수유량계에서 <input v-model="webSettings.transmissionCycle" type="number" /> 초에 한번씩 데이터를 전송합니다.</td>
        </tr>
        <tr>
          <td>시스템</td>
          <td>데이터 미수신 주기</td>
          <td colspan="2">데이터가 <input v-model="webSettings.noReceipt" type="number" /> 초 이상 들어오지 않을시 미수신으로 설정합니다.</td>
        </tr>
        <tr>
          <td>시스템</td>
          <td>주수 중단 주기</td>
          <td colspan="2">데이터가 <input v-model="webSettings.stopPour" type="number" /> 초 이상 들어오지 않을시 주수 중단으로 설정합니다.</td>
        </tr>

        <!-- 현장 이용자 관리 -->
        <tr>
          <td>시스템</td>
          <td>현장 이용자</td>
          <td>
            <button class="web-save-button" @click="openModal('list')" :style="{ backgroundColor: primaryColor }">목록</button>
          </td>
          <td>
            <button class="web-save-button" @click="openModal('register')" :style="{ backgroundColor: primaryColor }">등록</button>
          </td>
        </tr>

        <!-- 알림 대상자(사번) 관리 -->
        <tr>
          <td>알림</td>
          <td>알림 대상자(사번)</td>
          <td>
            <button class="web-save-button" @click="openAlarmModal('alarm-list')" :style="{ backgroundColor: primaryColor }">목록</button>
          </td>
          <td>
            <button class="web-save-button" @click="openAlarmModal('alarm-register')" :style="{ backgroundColor: primaryColor }">등록</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ===== 현장 이용자 모달 (알림 모달과 동일 UI 패턴) ===== -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content" :class="isDark ? 'dark-mode' : 'light-mode'">
        <h3 v-if="modalMode === 'list'">현장 이용자 목록</h3>
        <h3 v-else>현장 이용자 등록</h3>

        <!-- 목록 -->
        <div v-if="modalMode === 'list'">
          <ul>
            <li
              v-for="(u, idx) in userList"
              :key="u.idx"
              style="display:flex; align-items:center; gap:10px;"
            >
              <span style="flex:1;">
                {{ idx + 1 }}. {{ u.name }}
                <span style="font-size:12px; color:#888;">(등록: {{ u.createdAt }})</span>
              </span>
              <button
                class="web-save-button"
                @click="deleteUser(u.idx)"
                :style="{ backgroundColor: '#ff5b5b' }"
              >
                삭제
              </button>
            </li>
          </ul>
          <div v-if="!userList.length" style="color:#888; padding-top:6px;">등록된 이용자가 없습니다.</div>
        </div>

        <!-- 등록 -->
        <div v-else>
          <input v-model="newUserName" type="text" placeholder="이름 입력 (예: 홍길동)" />
          <button class="web-save-button" @click="saveUser">저장</button>
          <p style="font-size:12px; color:#888; margin-top:6px;">※ 동일 이름 중복은 허용되며, 필요 시 백엔드에서 고유키로 구분합니다.</p>
        </div>

        <div class="modal-actions">
          <button class="web-close-button" @click="closeModal">닫기</button>
          <div class="modal-switchers">
            <button
              v-if="modalMode !== 'list'"
              class="linklike"
              @click="openModal('list')"
            >목록 보기</button>
            <button
              v-if="modalMode !== 'register'"
              class="linklike"
              @click="openModal('register')"
            >등록하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 알림 대상자 모달 ===== -->
    <div v-if="isAlarmModalOpen" class="modal-overlay">
      <div class="modal-content" :class="isDark ? 'dark-mode' : 'light-mode'">
        <h3 v-if="alarmModalMode === 'alarm-list'">알림 대상자 목록</h3>
        <h3 v-else>알림 대상자 등록</h3>

        <!-- 알림: 목록 -->
        <div v-if="alarmModalMode === 'alarm-list'">
          <ul>
            <li v-for="(u, idx) in alarmUserList" :key="u.idx" style="display:flex; align-items:center; gap:10px;">
              <span style="flex:1;">
                {{ idx + 1 }}. {{ u.workerNo }}
                <span style="font-size:12px; color:#888;">(등록: {{ u.createdAt }})</span>
              </span>
              <button class="web-save-button" @click="deleteAlarmUser(u.idx)" :style="{ backgroundColor: '#ff5b5b' }">
                삭제
              </button>
            </li>
          </ul>
          <div v-if="!alarmUserList.length" style="color:#888; padding-top:6px;">등록된 알림 대상자가 없습니다.</div>
        </div>

        <!-- 알림: 등록 -->
        <div v-else>
          <input v-model="newWorkerNo" type="text" placeholder="사번 입력 (예: A123456)" />
          <button class="web-save-button" @click="saveAlarmUser">저장</button>
          <p style="font-size:12px; color:#888; margin-top:6px;">※ 동일 사번 중복 등록은 자동으로 무시됩니다.</p>
        </div>

        <div class="modal-actions">
          <button class="web-close-button" @click="closeAlarmModal">닫기</button>
          <div class="modal-switchers">
            <button
              v-if="alarmModalMode !== 'alarm-list'"
              class="linklike"
              @click="openAlarmModal('alarm-list')"
            >목록 보기</button>
            <button
              v-if="alarmModalMode !== 'alarm-register'"
              class="linklike"
              @click="openAlarmModal('alarm-register')"
            >등록하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import axiosIns from '@/plugins/axios' 
import { useShipStore } from '@/stores/shipStore'
import { getWebSettings, saveWebSettings } from '@/api/setting'
import { getUserList, insertUser, removeUser } from '@/api/user'
import { getAlarmUserList, insertAlarmUser, removeAlarmUser } from '@/api/alarmUser'

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const primaryColor = computed(() => theme.current.value.colors.primary)
const shipStore = useShipStore()

const webSettings = ref({
  transmissionCycle: '',
  noReceipt: '',
  stopPour: '',
})

async function settingSave() {
  const t = webSettings.value.transmissionCycle
  const n = webSettings.value.noReceipt
  const s = webSettings.value.stopPour

  // 빈값/공백 방지 + 숫자 유효성 체크
  if (
    [t, n, s].some(v => v === undefined || v === null || String(v).trim() === '') ||
    ![t, n, s].every(v => Number.isFinite(Number(v)))
  ) {
    alert('모든 설정값을 올바르게 입력하세요.')
    return
  }

  try {
    const ok = await saveWebSettings({
      transmissionCycle: Number(t),
      noReceipt: Number(n),
      stopPour: Number(s),
    })

    if (ok) {
      shipStore.fetchSettings()
      alert('저장 완료!')
    } else {
      alert('저장 실패')
    }
  } catch (err) {
    console.error('설정 저장 실패:', err)
    alert('저장 실패 (서버 오류)')
  }
}

/* ----------------------------
 * 현장 이용자 모달 상태 (알림 모달과 동일 UI 패턴)
 * -------------------------- */
const isModalOpen = ref(false)
const modalMode = ref('list') // 'list' | 'register'
const userList = ref([])      // [{ idx, name, createdAt, updatedAt }]
const newUserName = ref('')

async function openModal(mode) {
  modalMode.value = mode
  isModalOpen.value = true

  if (mode === 'list') {
    await fetchUsers()
  }
}

function closeModal() {
  isModalOpen.value = false
  newUserName.value = ''
}

async function fetchUsers() {
  try {
    userList.value = await getUserList()
  } catch (err) {
    console.error('유저 목록 조회 실패:', err)
    alert('유저 목록 조회 실패')
  }
}

async function saveUser() {
  if (!newUserName.value.trim()) {
    alert('이름을 입력하세요.')
    return
  }
  try {
    const data = await insertUser(newUserName.value.trim())
    const ok = data.success

    if (ok) {
      await fetchUsers() // 이미 getUserList() 사용 중이라면 그대로 유지
      alert('저장 완료')
      newUserName.value = ''
      // modalMode.value = 'list' // 필요 시 전환
    } else {
      alert('등록 실패')
    }
  } catch (err) {
    console.error('유저 등록 실패:', err)
    alert('등록 실패 (서버 오류)')
  }
}

async function deleteUser(idx) {
  if (!confirm('삭제하시겠습니까?')) return

  try {
    const data = await removeUser(idx)
    const ok = data.success

    
    if (ok) {
      await fetchUsers()
      alert('삭제 완료')
    } else {
      alert('삭제 실패')
    }
  } catch (e) {
    console.error('유저 삭제 실패:', e)
    alert('삭제 실패 (서버 오류)')
  }
}

/* -----------------------------------
 * 알림 대상자(사번) 모달 상태
 * --------------------------------- */
const isAlarmModalOpen = ref(false)
const alarmModalMode = ref('alarm-list') // 'alarm-list' | 'alarm-register'
const alarmUserList = ref([])            // [{ idx, workerNo, createdAt, updatedAt }]
const newWorkerNo = ref('')

async function openAlarmModal(mode) {
  alarmModalMode.value = mode
  isAlarmModalOpen.value = true

  if (mode === 'alarm-list') {
    await fetchAlarmUsers()
  }
}

function closeAlarmModal() {
  isAlarmModalOpen.value = false
  newWorkerNo.value = ''
}

async function fetchAlarmUsers() {
  try {
    alarmUserList.value = await getAlarmUserList()
  } catch (e) {
    console.error('알림 대상자 목록 조회 실패:', e)
    alert('알림 대상자 목록 조회 실패')
  }
}

async function saveAlarmUser() {
  const workerNo = newWorkerNo.value?.trim()
  if (!workerNo) {
    alert('사번을 입력하세요.')
    return
  }
  try {
    /*
    const ok = await insertAlarmUser(workerNo)
    if (ok) {
      await fetchAlarmUsers()   // 기존 목록 새로고침 함수
      alert('등록 완료')
      newWorkerNo.value = ''    // 폼 초기화
    } else {
      alert('등록 실패')
    }
    */
    await insertAlarmUser(workerNo)
    await fetchAlarmUsers()   // 기존 목록 새로고침 함수
    alert('등록 완료')
  } catch (e) {
    console.error('알림 대상자 등록 실패:', e)
    alert('등록 실패 (서버 오류)')
  }
}

async function deleteAlarmUser(idx) {
  if (!confirm('삭제하시겠습니까?')) return

  try {
    /*
    const ok = await removeAlarmUser(idx)
    if (ok) {
      await fetchAlarmUsers()
      alert('삭제 완료')
    } else {
      alert('삭제 실패')
    }
    */
    await removeAlarmUser(idx)
      .then (res => {
        fetchAlarmUsers()
        alert('삭제 완료')    
      })
    
  } catch (e) {
    console.error('알림 대상자 삭제 실패:', e)
    alert('삭제 실패 (서버 오류)')
  }
}

onMounted(async () => {
  try {
    const data = await getWebSettings()
    webSettings.value.transmissionCycle = data.transmissionCycle
    webSettings.value.noReceipt = data.noReceipt
    webSettings.value.stopPour = data.stopPour
  } catch (err) {
    console.error('설정 불러오기 실패:', err)
  }
})
</script>

<style scoped>
.settings-wrapper {
  padding: 20px;
  border-radius: 8px;
  height: 100%;
  min-height: 0;
}

.dark-mode {
  background: #1e1e2d;
  color: white;
}

.light-mode {
  background: #f9f9f9;
  color: #222;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.web-save-button,
.web-close-button,
.db-save-button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  background-color: #754bcb;
  color: white;
  cursor: pointer;
}

.web-close-button {
  background-color: black;
}

.web-settings-table,
.db-settings-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
}

.web-settings-table th,
.web-settings-table td,
.db-settings-table th,
.db-settings-table td {
  padding: 8px 12px;
  text-align: center;
  border: 1px solid;
}

.dark-mode .web-settings-table,
.dark-mode .db-settings-table {
  background: #2c2c3b;
}

.dark-mode th {
  background: #2a2a3a;
  color: white;
  border-color: #444;
}

.dark-mode td {
  border-color: #444;
}

.light-mode .web-settings-table,
.light-mode .db-settings-table {
  background: white;
}

.light-mode th {
  background: #d4d4d4;
  color: black;
  border-color: #bbb;
}

.light-mode td {
  border-color: #ccc;
}

.web-settings-table input,
.web-settings-table select,
.db-settings-table input,
.db-settings-table select {
  appearance: auto;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #888;
  width: 100px;
  text-align: center;
}

/* 모달 공통 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  min-width: 320px;
  max-width: 560px;
  width: 92%;
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
}

.modal-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modal-content li {
  padding: 8px 0;
  border-bottom: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.linklike {
  background: none;
  border: none;
  color: #6b5bd6;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.modal-switchers {
  display: flex;
  gap: 12px;
}
</style>
