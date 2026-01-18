<template>
  <div
    class="device-table-card"
    :class="[isDark ? 'dark-mode' : 'light-mode']"
  >
    <h3 class="table-title">
      통신상태
    </h3>
    <table class="device-table">
      <thead>
        <tr>
          <th colspan="2">
            통신상태
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(device, index) in devices"
          :key="index"
        >
          <td
            class="comm-status"
            :class="[device.receive === '수신' ? 'on' : 'off']"
          >
            {{ device.receive }}
          </td>
        </tr>
        <tr>
          <th colspan="2">
            최종 수신시간
          </th>
        </tr>
        <tr
          v-for="(device, index) in devices"
          :key="'time-' + index"
        >
          <td colspan="2">
            {{ lastTimes[index] ?? '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { computed, onMounted, ref, watch } from 'vue'
import { useShipStore } from '@/stores/shipStore'
import axiosIns from '@/plugins/axios'
import { getFlowLastTime } from '@/api/flow'

const props = defineProps({
  devices: {
    type: Array,
    required: true,
  },
  tank_name: {
    type: String,
    required: "",
  },
})


const shipStore = useShipStore()

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)

// 최종 수신시간 관리
const lastTimes = ref([])

const fetchLastTime = async (device, index) => {
  try {
    // 미수신이 아닐 땐 그대로 표시
    if (device.receive !== '미수신') {
      lastTimes.value[index] = device.lastTime || '-'
      return
    }

    const data = await getFlowLastTime({
      ship_no: shipStore.selectedShip,
      tank_name: props.tank_name,
    })

    if (data?.lastTime) {
      lastTimes.value[index] = data.lastTime
    } else {
      lastTimes.value[index] = '-'
    }
  } catch (err) {
    console.error('last-time 조회 실패:', err)
    lastTimes.value[index] = '-'
  }
}

// devices 변경될 때마다 다시 갱신
watch(
  () => props.devices,
  (newDevices) => {
    lastTimes.value = new Array(newDevices.length).fill('-')
    newDevices.forEach((d, i) => fetchLastTime(d, i))
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.device-table-card {
  padding: 12px;
  border-radius: 12px;
  min-width: 0;
  overflow-x: auto;
  font-family: sans-serif;
  flex: 1 1 0%;
  max-width: 320px;
  margin: 0 auto;
  justify-items: center;
}

.device-table {
  border-collapse: collapse;
  font-size: 14px;
  min-width: 250px;
  width: 100%;
  text-align: center;
}

.device-table th,
.device-table td {
  padding: 8px;
  border: 1px solid #ccc;
}

.device-table tr:hover {
  background-color: #eee;
}

.device-table-card.dark-mode {
  background-color: #2b2b3b;
  color: white;
}

.device-table-card.dark-mode .device-table th,
.device-table-card.dark-mode .device-table td {
  border-color: #444;
}

.device-table-card.dark-mode .device-table thead,
.device-table-card.dark-mode .device-table .sub-th {
  background-color: #1f1f2f;
}

.device-table-card.dark-mode .device-table tr:hover {
  background-color: #333;
}

.device-table-card.light-mode {
  background-color: #ffffff;
  color: #222;
}

.device-table-card.light-mode .device-table thead,
.device-table-card.light-mode .device-table .sub-th {
  background-color: #f3f3f3;
}

.device-table-card.light-mode .device-table tr:hover {
  background-color: #eee;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
}

.comm-status.on {
  color: #4ade80;
  font-weight: bold;
}

.comm-status.off {
  color: #f87171;
  font-weight: bold;
}
</style>
