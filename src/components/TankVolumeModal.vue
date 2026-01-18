<template>
  <div
    v-if="visible"
    class="modal-overlay"
    @click.self="close"
  >
    <div
      class="modal-content"
      :class="{ dark: isDark }"
      :style="{ '--primary-color': primaryColor }"
    >
      <h2 class="modal-title">
        {{
          mode === 'register'
            ? '장치 등록'
            : mode === 'edit'
              ? '장치 수정'
              : 'Tank Volume'
        }}
      </h2>
      <p class="modal-subtitle">
        {{
          mode === 'register'
            ? '새 장치를 등록하세요.'
            : mode === 'edit'
              ? '장치를 수정하세요.'
              : 'Volume 파일을 등록/수정하세요.'
        }}
      </p>

      <div
        v-if="device"
        class="modal-body"
      >
        <div class="input-section">
          <!-- 위치 변경: UUID 먼저 -->
          <div class="input-row">
            <label>UUID:</label>
            <template v-if="isEditableMode">
              <select
                v-model="device.uuid"
                @change="handleUuidChange"
              >
                <option
                  v-for="opt in UUID_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </template>
            <template v-else>
              <span>{{ device.uuid }}</span>
            </template>
          </div>

          <!-- 장치명은 UUID에 의해 하드코딩/자동 세팅 (읽기 전용) -->
          <div class="input-row">
            <label>장치명:</label>
            <span>{{ device.name }}</span>
          </div>

          <div class="input-row">
            <label>설치 호선:</label>
            <template v-if="isEditableMode">
              <input
                v-model="device.ship"
                type="text"
                inputmode="numeric"
                @input="validateShip"
                @change="handleShipChange"
              >
            </template>
            <template v-else>
              <span>{{ device.ship }}</span>
            </template>
          </div>

          <div class="input-row">
            <label>설치 탱크:</label>
            <template v-if="isEditableMode">
              <input
                v-model="device.tank"
                @input="forceTankNameToDevice"
              >
            </template>
            <template v-else>
              <span>{{ device.tank }}</span>
            </template>
          </div>

          <!-- 탱크 Branch는 숨김 (표시/입력 제거) -->
          <!--
            <div class="input-row">
            <label>탱크 Branch:</label>
            <template v-if="isEditableMode">
            <select v-model="device.branch">
            <option value="-">-</option>
            <option value="A">A</option>
            <option value="B">B</option>
            </select>
            </template>
            <template v-else>
            <span>{{ device.branch }}</span>
            </template>
            </div>
          -->
        </div>

        <div class="volume-wrapper">
          <div class="file-and-name">
            <label class="file-label">파일 선택:</label>
            <input
              ref="fileInputRef"
              type="file"
              class="file-input"
              @change="handleFileChange"
            >
          </div>

          <div class="table-box">
            <table class="volume-table">
              <thead>
                <tr>
                  <th>Tank ID</th>
                  <th>Tank Name</th>
                  <th>From Bottom (m)</th>
                  <th>Volume (m³)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in volumeData"
                  :key="idx"
                >
                  <td>{{ row.tank_id }}</td>
                  <td>{{ device.tank }}</td>
                  <td>{{ row.from_bottom }}</td>
                  <td>{{ row.volume }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="modal-close-btn"
          @click="close"
        >
          닫기
        </button>
        <button
          class="modal-save-btn"
          :style="{ backgroundColor: primaryColor }"
          @click="save"
        >
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useTheme } from 'vuetify'
import { useShipStore } from '@/stores/shipStore'
import axiosIns from '@/plugins/axios'
import { insertModule, updateModule } from '@/api/module'
import { insertEvent } from '@/api/event'
import { findTankVolume, saveTankVolumes } from '@/api/tankVolume'

const props = defineProps({
  visible: { type: Boolean, required: true },
  device: { type: Object, required: true },
  mode: { type: String, default: 'edit' },
})

const emit = defineEmits(['close'])

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const primaryColor = computed(() => theme.current.value.colors.primary)
const shipStore = useShipStore()

const UUID_A = 'ebb07420-50c3-11f0-b562-db4778516eef'
const UUID_B = 'dce74d50-7676-11f0-9096-590fae28ea27'

const UUID_OPTIONS = [
  { label: 'ebb07420-50c3-11f0-b562-db4778516eef (A)', value: UUID_A },
  { label: 'dce74d50-7676-11f0-9096-590fae28ea27 (B)', value: UUID_B },
]

// UUID → 장치명 매핑 하드코딩
const NAME_BY_UUID = {
  [UUID_A]: '유량계 A',
  [UUID_B]: '유량계 B',
}

const selectedFile = ref(null)
const fileInputRef = ref(null)
const volumeData = ref([])
const tankList = ref([])
const fileChanged = ref(false)
const initialVolumeExists = ref(false)

const isEditableMode = computed(() => ['register', 'edit'].includes(props.mode))

// UUID -> Branch 자동 매핑
const selectedBranch = computed(() => {
  if (props.device?.uuid === UUID_A) return 'A'
  if (props.device?.uuid === UUID_B) return 'B'
  return '-' // 매핑 불가 시
})

const handleShipChange = () => {
  const ship = shipStore.shipList.find(s => s.name === props.device.ship)

  tankList.value = ship ? ship.tank.map(t => t.name) : []
}

// 화면의 device.tank를 언제나 진실 소스로 강제
const forceTankNameToDevice = () => {
  if (!Array.isArray(volumeData.value)) return
  volumeData.value = volumeData.value.map(r => ({
    ...r,

    // 저장/테이블용 tank_name은 항상 props.device.tank를 사용
    tank_name: props.device.tank,
  }))
}

// UUID 선택 시 장치명을 하드코딩된 값으로 자동 세팅
const handleUuidChange = () => {
  const newName = NAME_BY_UUID[props.device.uuid] || ''

  // eslint-disable-next-line vue/no-mutating-props
  props.device.name = newName
}

const handleFileChange = e => {
  const file = e.target.files[0]

  selectedFile.value = file
  if (!file) return
  fileChanged.value = true

  const reader = new FileReader()

  reader.onload = () => parseVolumeFile(reader.result)
  reader.readAsText(file)
}

const parseVolumeFile = content => {
  const idMatch = content.match(/TANK\s*ID\s*:\s*(.+?),/)

  //const /* nameMatch = */ content.match(/TANK\s*NAME\s*:\s*(.+)/) // 파일 탱크명은 무시 (고객 입력 우선)
  const fileId = idMatch?.[1]?.trim() || ''

  // if (['edit', 'volume-edit'].includes(props.mode) && fileName && fileName !== props.device.tank) {
  //   alert(`파일 탱크명(${fileName})이 현재 탱크명(${props.device.tank))과 다릅니다.`)
  //   selectedFile.value = null
  //   fileInputRef.value.value = ''
  //   return
  // }

  // ⛔ register 모드에서도 파일 이름으로 device.tank를 덮어쓰지 않음
  // if (props.mode === 'register' && fileName) {
  //   props.device.tank = fileName
  // }

  handleShipChange()

  const rows = content
    .split('\n')
    .reduce((acc, line) => {
      const m = line.trim().match(/^(\d+\.\d{1,3})\s+(\d+\.\d{1,3})\s+(\d+\.\d{1,3})/)
      if (m) {
        acc.push({
          tank_id:     fileId,
          tank_name:   props.device.tank,
          from_bottom: m[2],
          volume:      m[3],
        })
      }
      return acc
    }, [])

  volumeData.value = rows
}

const close = () => emit('close')

const save = async () => {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
  try {
    // 공통 필드
    const commonPayload = {
      module_type: 'test',
      module_name: props.device.name,
      module_branch: selectedBranch.value, 
      device_uuid: props.device.uuid,
      module_status: 'test',
      packet_delay: 10,
      ship_no: props.device.ship,
      tank_name: props.device.tank, 
      del_flag: 0,
    }

    if (props.mode === 'register') {
      // 신규 등록
      await insertModule(commonPayload)

      await insertEvent({
        eventType: 4,
        shipNo: props.device.ship,
        tankName: props.device.tank,
        stringKr: '신규 장치 등록',
        rgstDt: now,
        createdAt: now,
      })
    } else if (props.mode === 'edit') {
      // 수정
      await updateModule({
        ...commonPayload,
        module_idx: props.device.idx,
      })

      await insertEvent({
        eventType: 4,
        shipNo: props.device.ship,
        tankName: props.device.tank,
        stringKr: '장치 수정',
        rgstDt: now,
        createdAt: now,
      })
    }

    if (fileChanged.value) {
      // 저장 직전 강제 동기화
      forceTankNameToDevice()

      const volumePayload = volumeData.value.map(r => ({
        ship_no:     props.device.ship,
        tank_id:     r.tank_id,
        tank_name:   props.device.tank,
        from_bottom: r.from_bottom,
        volume:      r.volume,
        branch:      selectedBranch.value,
      }))

      /*
      const ok = await saveTankVolumes(volumePayload)

      const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
      const volumeEvent = initialVolumeExists.value ? '볼륨 테이블 수정' : '신규 볼륨 테이블 등록'

      // 저장 성공/실패와 무관하게 이벤트는 남기고 싶다면 try-catch로 개별 보호
      try {
        await insertEvent({
          eventType: 4,
          shipNo:    props.device.ship,
          tankName:  props.device.tank,
          stringKr:  volumeEvent,
          rgstDt:    now,
          createdAt: now,
        })
      } catch (e) {
        console.error('볼륨 이벤트 기록 실패:', e)
      }

      if (!ok) {
        alert('볼륨 저장 실패')
      } else {
        alert('볼륨 저장 완료')
      }
      */

      saveTankVolumes(volumePayload)
        .then(() => {
          alert('볼륨 저장 완료')
        })
        .catch(err => {
          alert('볼륨 저장 실패')
        })
        .finally(() => {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
          const volumeEvent = initialVolumeExists.value ? '볼륨 테이블 수정' : '신규 볼륨 테이블 등록'

          insertEvent({
            eventType: 4,
            shipNo:    props.device.ship,
            tankName:  props.device.tank,
            stringKr:  volumeEvent,
            rgstDt:    now,
            createdAt: now,
          }).catch(e => {
            console.error('볼륨 이벤트 기록 실패:', e)
          })
        })      
    }

    await shipStore.fetchAndInitShipList()
    alert('저장 완료')
    close()
  } catch (err) {
    console.error(err)
    alert('저장 실패: ' + err.message)
  }
}

watch(
  () => props.visible,
  async val => {
    if (val) {
      // UUID 기준 장치명 자동 세팅
      handleUuidChange()

      volumeData.value = []
      selectedFile.value = null
      tankList.value = []
      fileChanged.value = false
      initialVolumeExists.value = false

      if (props.device.ship && props.device.tank) {
        try {
          const rows = await findTankVolume({
            ship_no: props.device.ship,
            tank_name: props.device.tank,
          })

          if (Array.isArray(rows) && rows.length > 0) {
            // 불러온 데이터의 tank_name을 화면 값으로 정규화
            volumeData.value = rows.map(r => ({
              ...r,
              tank_name: props.device.tank,
            }))
            initialVolumeExists.value = true
          }
        } catch (e) {
          console.error('탱크 볼륨 조회 실패:', e)
        }
      }

      if (props.device.ship) handleShipChange()
    }
  },
  { immediate: true }
)

// ✅ 초기 마운트 시에도 한 번 보정 (안전)
onMounted(() => {
  handleUuidChange()
})

function validateShip(e) {
  let val = e.target.value

  // 숫자만 남기기
  if (!/^\d*$/.test(val)) {
    alert('숫자만 입력 가능합니다')
    val = val.replace(/\D/g, '') // 숫자 아닌 문자 제거
  }

  // 소수점 제거 (혹시 붙여넣기 등으로 들어올 경우)
  val = val.split('.')[0]

  // v-model 값 업데이트 (정수형으로 변환)
  e.target.value = val
  
  // eslint-disable-next-line vue/no-mutating-props
  props.device.ship = val ? parseInt(val, 10) : ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1002;
}
.modal-content {
  background-color: #ffffff;
  color: #000;
  border-radius: 8px;
  padding: 24px;
  width: 70%;
  height: 86%;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}
.modal-content.dark {
  background-color: #312d4b;
  color: #f0f0f0;
}
.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.modal-subtitle {
  font-size: 14px;
  margin-bottom: 16px;
}
.input-section {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}
.input-row label {
  min-width: 100px;
  font-weight: bold;
}
.input-row input,
.input-row select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff !important;
  color: #000 !important;
}
.input-row select {
  appearance: auto;
  -webkit-appearance: auto;
  -moz-appearance: auto;
}
.volume-wrapper {
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}
.file-and-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.file-input {
  flex: 1;
}
.table-box {
  max-height: 80%;
  overflow-y: auto;
  border-top: 1px solid #ccc;
}
.volume-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
}
.volume-table th,
.volume-table td {
  border: 1px solid #ccc;
  padding: 6px 8px;
}
.volume-table th {
  background-color: #f1e8f6;
  font-weight: bold;
}
.volume-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}
.volume-table tbody tr:nth-child(even) {
  background-color: #fcf9ff;
}
.dark .volume-table th {
  background-color: #3b355a;
  color: white;
}
.dark .volume-table tbody tr {
  background-color: #312d4b;
  color: #f0f0f0;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.modal-close-btn,
.modal-save-btn {
  margin-left: 8px;
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  background-color: #754bcb;
  color: white;
  cursor: pointer;
}
.modal-close-btn {
  background-color: black;
}
</style>
