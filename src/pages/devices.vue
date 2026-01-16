<template>
  <div>
    <div
      class="devices-page"
      :class="isDark ? 'dark-mode' : 'light-mode'"
      :style="{ '--primary-color': primaryColor }"
    >
      <div class="button-group">
        <!-- 등록 버튼 (선택 없을 때만 표시) -->
        <button
          class="btn-register"
          v-if="selectedCheck.length <= 0"
          @click="handleRegister"
          :style="{ backgroundColor: primaryColor }"
        >
          등록
        </button>

        <!-- 삭제 버튼 (선택 있을 때만 표시) -->
        <button
          class="delete-button"
          v-if="selectedCheck.length > 0"
          @click="handleDelete"
        >
          삭제
        </button>

        <!-- 수정 버튼 (선택 있을 때만 표시) -->
        <button
          v-if="selectedCheck.length > 0"
          @click="handleEdit"
          :style="{ backgroundColor: primaryColor }"
        >
          수정
        </button>

        <!-- 사용중 버튼 (선택 있을 때만 표시) -->
        <button
          v-if="selectedCheck.length > 0"
          @click="handleActivate"
          :style="{ backgroundColor: primaryColor }"
        >
          사용중
        </button>        

        <button
          v-if="selectedCheck.length > 0"
          @click="handleDeactivate"
          :style="{ backgroundColor: primaryColor }"
        >
          사용중지
        </button>
      </div>

      <div class="table-wrapper">
        <table class="device-table">
          <thead>
            <tr>
              <th class="col-check"></th>
              <th class="col-no">No</th>
              <th class="col-name">장치명</th>
              <!-- <th class="col-uuid">UUID</th> -->
              <th class="col-ship">등록호선</th>
              <th class="col-tank">등록탱크</th>
              <th class="col-branch">주수관</th>
              <th class="col-volume">Tank Volume 등록</th>
              <th class="col-usage">사용여부</th>
              <th class="col-created">생성일</th>
              <th class="col-updated">수정일</th>
              <th class="col-alarm">알림 설정</th>
            </tr>
          </thead>

          <!-- 데스크톱(>700px): 기존 1행 구조 -->
          <tbody v-if="!isNarrow">
            <tr
              v-for="(device, idx) in deviceList"
              :key="device.idx"
              :data-del-flag="device.del_flag"
            >
              <td class="col-check">
                <input
                  type="checkbox"
                  v-model="selectedCheck"
                  :value="device.idx"
                  @change="handleCheckboxChange(device.idx)"
                />
              </td>
              <td class="col-no">{{ idx + 1 }}</td>
              <td class="col-name">{{ device.name }}</td>
              <!-- <td class="col-uuid">{{ device.uuid }}</td> -->
              <td class="col-ship">{{ device.ship }}</td>
              <td class="col-tank">{{ device.tank }}</td>
              <td class="col-branch">{{ device.branch }}</td>
              <td class="col-volume">
                <span v-if="!isVolumeRegistered(device)">
                  미등록
                  <button
                    class="view-button"
                    @click="viewVolume(device)"
                    :style="{ backgroundColor: primaryColor }"
                  >등록</button>
                </span>
                <span v-else>
                  등록
                  <button
                    class="view-button"
                    @click="viewVolume(device)"
                    :style="{ backgroundColor: primaryColor }"
                  >보기</button>
                </span>
              </td>
              <td class="col-usage">
                <span v-if="device.del_flag === 0">사용중</span>
                <span v-else-if="device.del_flag === 2">사용중단</span>
                <span v-else>-</span>
              </td>
              <td class="col-created">{{ device.createdAt }}</td>
              <td class="col-updated">{{ device.updatedAt }}</td>
              <td class="col-alarm">
                <button
                  class="view-button"
                  @click="alarmModal(device)"
                  :style="{ backgroundColor: primaryColor }"
                >등록</button>
              </td>
            </tr>
          </tbody>

          <!-- 모바일(≤700px): 장치별 2행 구조 -->
          <tbody v-else>
            <template v-for="(device, idx) in deviceList" :key="device.idx">
              <!-- 1행: NO(rowspan=2) + 장치명 + 등록호선 + 등록탱크 + 알림설정 -->
              <tr class="mobile-mainrow" :data-del-flag="device.del_flag">
                <td class="col-no mobile-no" rowspan="2">{{ idx + 1 }}</td>
                <td class="col-name mobile-cell">{{ device.name }}</td>
                <td class="col-ship mobile-cell">{{ device.ship }}</td>
                <td class="col-tank mobile-cell">{{ device.tank }}</td>
                <td class="col-alarm mobile-cell">
                  <button
                    class="view-button"
                    @click="alarmModal(device)"
                    :style="{ backgroundColor: primaryColor }"
                  >등록</button>
                </td>
              </tr>
              <!-- 2행: 수정일만 -->
              <tr class="mobile-subrow" :data-del-flag="device.del_flag">
                <td class="mobile-updated-cell" colspan="4">
                  <span class="updated-label">수정일</span>
                  <span class="updated-value">{{ device.updatedAt }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <TankVolumeModal
      :visible="showModal"
      :device="selectedDevice"
      :mode="modalMode"
      @close="handleClose"
    />

    <!-- 알림 설정 모달 -->
    <div v-if="isModalOpen" class="alarm-modal-overlay">
      <div class="modal-content" :class="isDark ? 'dark-mode' : 'light-mode'">
        <h3 class="modal-title" @click="handleTitleClick">
          알림 기능
          <span v-if="modalShipNo && modalTankName">
            &nbsp;— ShipNo : {{ modalShipNo }} / TankName : {{ modalTankName }} / Tank Volume :
            <strong>{{ modalVolumeRegistered ? '등록' : '미등록' }}</strong>
          </span>
        </h3>

        <table class="alarm-settings-table">
          <thead>
            <tr>
              <th>설정명</th>
              <th colspan="2">설정값</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>설정 높이 별 알림</td>
              <td colspan="2">
                <div>
                  <div style="display:flex; justify-content: center; align-items:center; gap:12px; margin-bottom:8px;">
                    <span style="font-size:12px; color:#888; max-width:140px;">#1 (가장 낮음)</span>
                    <input v-model.number="alarmSettings.targetPour1" type="number" step="0.01" />
                    <span style="font-size:12px; color:#888;">m</span>
                  </div>

                  <div style="display:flex; justify-content: center; align-items:center; gap:12px; margin-bottom:8px;">
                    <span style="font-size:12px; color:#888; max-width:140px;">#2</span>
                    <input v-model.number="alarmSettings.targetPour2" type="number" step="0.01" />
                    <span style="font-size:12px; color:#888;">m</span>
                  </div>

                  <div style="display:flex; justify-content: center; align-items:center; gap:12px;">
                    <span style="font-size:12px; color:#888; max-width:140px;">#3 (가장 높음)</span>
                    <input v-model.number="alarmSettings.targetPour3" type="number" step="0.01" />
                    <span style="font-size:12px; color:#888;">m</span>
                  </div>

                  <div style="margin-top:6px; color:#666; font-size:12px;">
                    각 높이에 도달 시 단계별 알림을 발송합니다.
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>주수 완료 알림</td>
              <td colspan="2">
                목표 주수량 도달 시&nbsp;
                <input v-model.number="alarmSettings.completionMinutes" type="number" /> 분 간격으로 총&nbsp;
                <input v-model.number="alarmSettings.repetitionsNumber" type="number" /> 회 알림 발송을 합니다.
              </td>
            </tr>
          </tbody>
        </table>

        <div class="alarm-button-row" style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
          <button class="alarm-close-button" @click="closeAlarm">닫기</button>
          <button
            class="alarm-save-button"
            :style="{ backgroundColor: primaryColor }"
            @click="saveAll"
          >저장</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { useTheme } from 'vuetify'
import axiosIns from '@/plugins/axios'
import TankVolumeModal from '@/components/TankVolumeModal.vue'
import { useShipStore } from '@/stores/shipStore'
import { getDevices, deleteModules, deactivateModules, activateModules   } from '@/api/module'
import { hasTankVolume } from '@/api/tankVolume'
import { insertEvent } from '@/api/event'
import { getTargetPourHeights, upsertTargetPour  } from '@/api/settingTargetPour'
import { readPourFinish, savePourFinish  } from '@/api/pourFinish'
import { sendTestAlert } from '@/api/alarmUser'

// Vuetify Theme
const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const primaryColor = computed(() => theme.current.value.colors.primary)

const shipStore = useShipStore()

// 반응형 플래그 (≤700px)
const isNarrow = ref(typeof window !== 'undefined' ? window.innerWidth <= 700 : false)
function handleResize() {
  isNarrow.value = window.innerWidth <= 700
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// ───────────────────────────────────────────────────────────
// 상태
// ───────────────────────────────────────────────────────────
const deviceList = ref([])
const selectedCheck = ref([])

const showModal = ref(false)
const selectedDevice = ref(null)
const modalMode = ref('edit')

const isModalOpen = ref(false)
const clickCount = ref(0)
const modalShipNo = ref('')
const modalTankName = ref('')
const modalVolumeRegistered = ref(false)

// 알림 입력 모델 (3단 높이 + 완료설정)
const alarmSettings = ref({
  targetPour1: null,
  targetPour2: null,
  targetPour3: null,
  completionMinutes: '',
  repetitionsNumber: '',
})

//다건 선택 시에는 수정 기능은 불가
const canEdit = computed(() => selectedCheck.value.length === 1)

const toNumOrEmpty = v =>
  (v === null || v === undefined || v === '') ? '' :
    (typeof v === 'number' ? v : Number(v))

const keyOf = (ship, tank) => `${ship}|||${tank}`

// 장치 목록 로드
const fetchDeviceList = async () => {
  try {
    const baseDevices = await getDevices()

    const devicePromises = baseDevices.map(async (d) => {
      const device = {
        ...d,
        volumeRegistered: false,
      }

      if (device.ship && device.tank) {
        try {
          device.volumeRegistered = await hasTankVolume({
            ship_no: device.ship,
            tank_name: device.tank,
          })
        } catch {
          // 단건 실패는 무시하고 목록은 계속 구성
        }
      }

      return device
    })

    deviceList.value = await Promise.all(devicePromises)
  } catch (err) {
    console.error('장치 목록 불러오기 실패:', err)
    alert('장치 목록 조회 중 오류가 발생했습니다.')
  }
}

onMounted(async () => {
  await fetchDeviceList()
})

// 볼륨 모달
const isVolumeRegistered = (device) => device.volumeRegistered === true

const viewVolume = (device) => {
  selectedDevice.value = { ...device }
  modalMode.value = device.volumeRegistered ? 'volume-edit' : 'volume-register'
  showModal.value = true
}

// 등록/수정/삭제/중지
const handleRegister = () => {
  selectedDevice.value = {
    idx: null,
    name: '',
    uuid: '',
    ship: '',
    tank: '',
    branch: '',
    del_flag: 0,
    volumeRegistered: false,
    createdAt: '',
    updatedAt: '',
  }
  modalMode.value = 'register'
  showModal.value = true
}

const handleEdit = () => {

  if (selectedCheck.value.length !== 1) {
    alert('수정은 1건만 선택할 수 있습니다')
    return
  }

  const idx = selectedCheck.value[0]
  const device = deviceList.value.find((d) => d.idx === idx)
  if (device) {
    selectedDevice.value = { ...device }
    modalMode.value = 'edit'
    showModal.value = true
  }
}

const handleDelete = async () => {
  const targets = deviceList.value
    .filter((d) => selectedCheck.value.includes(d.idx))
    .map((d) => ({ ship_no: d.ship, tank_name: d.tank,  module_idx: d.idx }))

  if (
    !window.confirm(
      `정말 삭제하시겠습니까?\n` +
        targets.map((t) => `호선: ${t.ship_no}, 탱크: ${t.tank_name}`).join('\n'),
    )
  )
    return

  try {
    const ok = await deleteModules(targets)
    if (ok) {
      const ts = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')

      // 삭제 이벤트 기록 (병렬 처리)
      await Promise.all(
        targets.map(t =>
          insertEvent({
            eventType: 4,
            shipNo: t.ship_no,
            tankName: t.tank_name,
            stringKr: '장치 삭제',
            rgstDt: ts,
            createdAt: ts,
          })
        )
      )

      alert('삭제 완료되었습니다.')
      selectedCheck.value = []
      await fetchDeviceList()
    } else {
      alert('삭제 실패: 서버 응답 오류')
    }
  } catch (err) {
    console.error('삭제 중 오류 발생:', err)
    alert('삭제 중 오류 발생')
  }
}

const handleActivate = async () => {
  const targets = deviceList.value
    .filter((d) => selectedCheck.value.includes(d.idx))
    .map((d) => ({ device_uuid: d.uuid, module_idx: d.idx, ship_no: d.ship, tank_name: d.tank }))

  if (
    !window.confirm(
      `선택한 장치들을 사용중으로 변경하시겠습니까?\n` 
    )
  )
    return

  try {
    const ok = await activateModules(targets)
    if (ok) {
      const ts = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')

      // 이벤트 기록은 병렬 처리로 빠르게
      await Promise.all(
        targets.map(t =>
          insertEvent({
            eventType: 4,
            shipNo: t.ship_no,
            tankName: t.tank_name,
            stringKr: '장치 사용 시작',
            rgstDt: ts,
            createdAt: ts,
          })
        )
      )

      alert('사용중으로 변경 완료되었습니다.')
      selectedCheck.value = []
      await fetchDeviceList()
    } else {
      alert('사용중 처리 실패: 서버 응답 오류')
    }
  } catch (err) {
    console.error('상태 변경 중 오류 발생:', err)
    alert('상태 변경 중 오류 발생')
  }
}


const handleDeactivate = async () => {
  const targets = deviceList.value
    .filter((d) => selectedCheck.value.includes(d.idx))
    .map((d) => ({ ship_no: d.ship, tank_name: d.tank,module_idx: d.idx }))

  if (
    !window.confirm(
      `선택한 장치들을 사용중지 하시겠습니까?\n` 
    )
  )
    return

  try {
    const ok = await deactivateModules(targets)
    if (ok) {
      const ts = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')

      // 이벤트 기록은 병렬 처리로 빠르게
      await Promise.all(
        targets.map(t =>
          insertEvent({
            eventType: 4,
            shipNo: t.ship_no,
            tankName: t.tank_name,
            stringKr: '장치 사용 중지',
            rgstDt: ts,
            createdAt: ts,
          })
        )
      )

      alert('사용중지 완료되었습니다.')
      selectedCheck.value = []
      await fetchDeviceList()
    } else {
      alert('사용중지 실패: 서버 응답 오류')
    }
  } catch (err) {
    console.error('사용중지 중 오류 발생:', err)
    alert('사용중지 중 오류 발생')
  }
}

const handleCheckboxChange = (idx) => {
  /*
  if (selectedCheck.value.length > 1) {
    alert('하나의 장치만 선택할 수 있습니다.')
    selectedCheck.value = [idx]
  }
  */
}

const handleClose = async () => {
  showModal.value = false
  selectedCheck.value = []
  await fetchDeviceList()
  await shipStore.fetchAndInitShipList()
}

// 알림 모달
const alarmModal = async (device) => {
  isModalOpen.value = true
  modalShipNo.value = device.ship || ''
  modalTankName.value = device.tank || ''
  modalVolumeRegistered.value = isVolumeRegistered ? isVolumeRegistered(device) : !!device?.volumeRegistered

  // 기본값 초기화
  alarmSettings.value = {
    targetPour1: null,
    targetPour2: null,
    targetPour3: null,
    completionMinutes: '',
    repetitionsNumber: '',
  }

  // 1) 높이 리스트
  try {
    const heights = await getTargetPourHeights({
      ship_no: modalShipNo.value,
      tank_name: modalTankName.value,
    })

    alarmSettings.value.targetPour1 = heights[0] ?? null
    alarmSettings.value.targetPour2 = heights[1] ?? null
    alarmSettings.value.targetPour3 = heights[2] ?? null
  } catch (e) {
    console.error('target-pour/list load fail:', e)
  }

  // 2) 완료 설정
  try {
    const pf = await readPourFinish({
      ship_no: modalShipNo.value,
      tank_name: modalTankName.value,
    })

    // 네가 쓰는 헬퍼 유지
    alarmSettings.value.completionMinutes = toNumOrEmpty(pf.completionMinutes)
    alarmSettings.value.repetitionsNumber = toNumOrEmpty(pf.repetitionsNumber)
  } catch (e) {
    console.error('pour-finish/read load fail:', e)
  }
}

function closeAlarm() {
  isModalOpen.value = false
}

// ✅ 단일 저장 버튼: 기존 두 저장 로직을 순차 호출
const saveAll = async () => {
  await saveHeightAlarm()
  await saveGoalAlarm()
}

// 높이 저장
// eslint-disable-next-line sonarjs/cognitive-complexity
async function saveHeightAlarm() {
  if (!modalVolumeRegistered.value) {
    alert('Tank Volume을 먼저 등록해야 이 항목을 설정할 수 있습니다.')
    return
  }

  const raw1 = alarmSettings.value?.targetPour1
  const raw2 = alarmSettings.value?.targetPour2
  const raw3 = alarmSettings.value?.targetPour3
  const t1 = raw1 == null || raw1 === '' ? null : Number(raw1)
  const t2 = raw2 == null || raw2 === '' ? null : Number(raw2)
  const t3 = raw3 == null || raw3 === '' ? null : Number(raw3)

  if (t1 === null || !Number.isFinite(t1) || t1 <= 0) {
    alert('첫번째 높이는 0보다 큰 숫자여야 합니다.')
    return
  }
  if (t2 !== null && (raw1 == null || raw1 === '')) {
    alert('첫번째 높이 없이 두번째 높이는 설정할 수 없습니다.')
    return
  }
  if (t3 !== null && (raw1 == null || raw1 === '') && (raw2 == null || raw2 === '')) {
    alert('첫번째, 두번째 높이 없이 세번째 높이는 설정할 수 없습니다.')
    return
  }

  for (const [label, v] of [['두번째', t2], ['세번째', t3]]) {
    if (v !== null && (!Number.isFinite(v) || v <= 0)) {
      alert(`${label} 높이는 0보다 큰 숫자여야 합니다.`)
      return
    }
  }

  const entered = [t1, t2, t3].filter((v) => v !== null)
  if (new Set(entered).size !== entered.length) {
    alert('동일한 높이가 입력되었습니다.')
    return
  }
  if (t2 !== null && !(t2 > t1)) {
    alert('두번째 높이는 첫번째보다 낮을 수 없습니다.')
    return
  }
  if (t3 !== null && t2 !== null && !(t3 > t2)) {
    alert('세번째 높이는 두번째보다 낮을 수 없습니다.')
    return
  }
  if (t3 !== null && t2 == null && !(t3 > t1)) {
    alert('세번째 높이는 첫번째보다 낮을 수 없습니다.')
    return
  }

  const shipNo = (modalShipNo.value || '').toString().trim()
  const tankName = (modalTankName.value || '').toString().trim()
  if (!shipNo || !tankName) {
    alert('호선/탱크 정보를 확인하세요.')
    return
  }

  const payload = {
    ship_no: shipNo,
    tank_name: tankName,
    ...(t1 != null ? { target_pour_1: t1 } : {}),
    ...(t2 != null ? { target_pour_2: t2 } : {}),
    ...(t3 != null ? { target_pour_3: t3 } : {}),
  }

  try {
    /*
    const ok = await upsertTargetPour(payload)
    if (ok) {
      alert('저장 완료')
    } else {
      alert('등록 실패')
    }
    */

    //console.log('upsertTargetPour')
    await upsertTargetPour(payload)
    alert('저장 완료')
  } catch (err) {
    console.error('높이 설정 저장 실패:', err)
    alert('등록 실패 (서버 오류)')
  }
}

// 완료 알림 저장
async function saveGoalAlarm() {
  const cm = alarmSettings.value?.completionMinutes
  const rn = alarmSettings.value?.repetitionsNumber

  if (cm == null || String(cm).trim() === '' || rn == null || String(rn).trim() === '') {
    alert('모든 항목을 입력해 주세요.')
    return
  }

  const completion = Number(cm)
  const repetitions = Number(rn)
  if (!Number.isFinite(completion) || completion <= 0 || !Number.isFinite(repetitions) || repetitions <= 0) {
    alert('발송 간격/횟수는 0보다 큰 숫자여야 합니다.')
    return
  }

  const shipNo = (modalShipNo.value || '').toString().trim()
  const tankName = (modalTankName.value || '').toString().trim()
  if (!shipNo || !tankName) {
    alert('호선/탱크 정보를 확인하세요.')
    return
  }

  const payload = {
    ship_no: shipNo,
    tank_name: tankName,
    completion_minutes: completion,
    repetitions_number: repetitions,
  }

  try {
    /*const ok = await savePourFinish(payload)
    if (ok) {
      alert('저장 완료')
    } else {
      alert('등록 실패')
    }
    */
    await savePourFinish(payload)
    alert('저장 완료')
  } catch (err) {
    console.error('완료 설정 저장 실패:', err)
    alert('등록 실패 (서버 오류)')
  }
}

// 제목 5번 클릭 시 Bot 알림 테스트
const handleTitleClick = async () => {
  clickCount.value++
  if (clickCount.value === 5) {
    clickCount.value = 0
    try {
      await sendTestAlert({
        title: '주수 모니터링 시스템 알림',
        msg: 'IoT 알림 발송 테스트 입니다.',
        shipNo: modalShipNo.value,
        tankName: modalTankName.value,
      })
      alert('테스트 알림이 발송되었습니다.')
    } catch (err) {
      console.error('테스트 알림 발송 실패:', err)
      alert('알림 발송 중 오류가 발생했습니다.')
    }
  }
}
</script>

<style scoped>
.devices-page {
  padding: 20px;
  font-family: sans-serif;
}

.button-group {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 버튼들 공통 */
.button-group button,
.view-button {
  margin-left: 8px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  background-color: var(--primary-color);
}

/* 삭제 버튼 색상 */
.button-group .delete-button { background-color: black; }

.table-wrapper { overflow-x: auto; }

.device-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
}

.device-table th,
.device-table td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.device-table thead { background-color: #f1e8f6; }
.dark-mode .device-table thead { background-color: #3b355a; color: white; }

.device-table tbody tr:nth-child(odd) { background-color: #ffffff; }
.device-table tbody tr:nth-child(even) { background-color: #fcf9ff; }
.dark-mode .device-table tbody tr:nth-child(odd),
.dark-mode .device-table tbody tr:nth-child(even) { background-color: #312d4b; }

.device-table tr:hover { background-color: #f0f0f0; }
.dark-mode .device-table tr:hover { background-color: #444; }

.view-button { margin-left: 6px; font-size: 12px; padding: 2px 6px; }

/* =========================================
   알림 설정 테이블
   ========================================= */
.alarm-settings-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  table-layout: fixed; /* ✅ 셀 넓이를 균등 분배해 좁은 화면에서 넘침 방지 */
}
.alarm-settings-table th,
.alarm-settings-table td {
  padding: 8px 12px;
  text-align: center;     /* ✅ 가로 중앙정렬 */
  vertical-align: middle; /* ✅ 세로 중앙정렬 */
  border: 1px solid;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* 다크/라이트 테마 경계/배경 유지 */
.dark-mode .alarm-settings-table { background: #2c2c3b; color: #fff; border-color: #555; }
.dark-mode .alarm-settings-table th,
.dark-mode .alarm-settings-table td { border-color: #555; }
.light-mode .alarm-settings-table { background: #fff; color: #000; border-color: #ccc; }
.light-mode .alarm-settings-table th,
.light-mode .alarm-settings-table td { border-color: #ccc; }

.light-mode .modal-title{ color: white }

/* 입력/선택 공통 */
.alarm-settings-table input,
.alarm-settings-table select {
  appearance: auto;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #888;
  width: 100px;
  text-align: center;
}

/* ✅ flex 행 내부도 가운데 정렬 */
.alarm-settings-table td div[style*="display:flex"] {
  justify-content: center;
}

/* ✅ 안내 문구 가운데 정렬 */
.alarm-settings-table td div[style*="margin-top:6px"] {
  text-align: center;
}

.alarm-save-button,
.alarm-close-button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  justify-self: center;
  align-items: center;
  color: #fff;
}

.light-mode .alarm-close-button { background-color: #000; color: #fff; }

/* =========================================
   모달
   ========================================= */
.modal-overlay,
.alarm-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1002;
}

/* ✅ 뷰포트에 맞춰 수축/스크롤 가능하도록 */
.modal-content {
  min-width: 200px;
  max-width: 900px;
  padding: 20px;
  border-radius: 8px;
  box-sizing: border-box;
  max-height: 90vh;
  overflow: auto;
}
.dark-mode .modal-content { background: #1e1e2f; color: #fff; border: 1px solid #555; }
.light-mode .modal-content { background: #fff; color: #000; border: 1px solid #ccc; }

.alarm-button-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

/* =========================================
   반응형: 700px 이하 처리 (클래스 기반)
   ========================================= */
@media (max-width: 700px) {
  /* 등록 버튼 숨김 */
  .button-group .btn-register { display: none; }

  /* 사용중단(del_flag=2) 행은 모바일에서만 숨김 (두 줄 모두 적용) */
  .device-table tr[data-del-flag="2"] { display: none !important; }

  /* 모바일에서 숨길 열(헤더/바디 동시에): 체크박스, 주수관, Volume, 사용여부, 생성일, (기본)수정일 */
  .device-table th.col-check,  .device-table td.col-check,
  .device-table th.col-branch, .device-table td.col-branch,
  .device-table th.col-volume, .device-table td.col-volume,
  .device-table th.col-usage,  .device-table td.col-usage,
  .device-table th.col-created,.device-table td.col-created,
  .device-table th.col-updated,.device-table td.col-updated {
    display: none !important;
  }

  /* 폰트/셀폭 약간 축소 */
  .device-table { font-size: 12px; }
  .device-table th, .device-table td { max-width: 160px; font-size: 12px; }

  /* 2행 레이아웃 셀 스타일 */
  .mobile-mainrow .mobile-no {
    font-weight: 700;
    vertical-align: middle;
    background: rgba(0,0,0,0.03);
    min-width: 36px;
    writing-mode: horizontal-tb !important;
    white-space: nowrap !important;
  }
  .mobile-mainrow .mobile-cell {
    white-space: nowrap !important;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }
  .mobile-subrow .mobile-updated-cell {
    text-align: left;
    padding: 6px 8px;
    white-space: normal !important;   /* 수정일은 줄바꿈 허용 */
    word-break: break-word;
    border-top: none;
  }
  .mobile-subrow .updated-label {
    display: inline-block; margin-right: 6px; font-weight: 600; opacity: 0.8;
  }
  .mobile-subrow .updated-value { display: inline; }
}

/* 추가 반응형(기존 유지) */
@media (max-width: 580px) {
  .devices-page { padding: 12px; }
  .button-group { flex-direction: column; align-items: flex-end; }
  .button-group button, .view-button {
    font-size: 12px; padding: 4px 8px; margin: 4px 0;
  }
  .device-table { font-size: 12px; }
  .device-table th, .device-table td { padding: 4px 6px; }
}
@media (max-width: 475px) {
  .button-group button, .view-button { font-size: 10px; padding: 3px 6px; }
  .device-table { font-size: 11px; }
  .device-table th, .device-table td { padding: 3px 5px; }
}

/* ✅ 초소형 디바이스 최적화 (375px 이하에서 넘침 방지) */
@media (max-width: 400px) {
  .modal-content {
    width: 96vw;
    padding: 12px;
  }
  .alarm-settings-table th,
  .alarm-settings-table td {
    padding: 6px 8px;
  }
  .alarm-button-row {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
