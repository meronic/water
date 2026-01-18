<template>
  <v-card class="rounded-lg fill-height d-flex flex-column" elevation="2" border>
    
    <v-card-item v-if="isDashboard" class="py-3 px-4 border-b flex-grow-0">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        이벤트 발생 현황
      </v-card-title>
    </v-card-item>

    <div class="flex-grow-1 overflow-y-auto" style="min-height: 0;">
      
      <div v-if="smAndDown" class="pa-2">
        <template v-if="hasEvents">
          <v-card
            v-for="(event, index) in displayedEvents"
            :key="event.id || index"
            class="mb-3 pa-3 bg-grey-lighten-5 rounded-lg"
            variant="flat"
            border
          >
            <div 
              class="text-body-2 font-weight-bold mb-1 text-wrap-content"
              :class="getStatusTextColor(event.string_kr)"
            >
              {{ event.string_kr }}
            </div>
            
            <div class="d-flex flex-wrap align-center text-body-2 text-medium-emphasis mb-2 gap-2">
              <span>{{ event.rgst_dt }}</span>
              <v-divider vertical class="mx-2" />
              <span>{{ event.ship_no }}</span>
              <v-divider vertical class="mx-2" />
              <span>{{ event.tank_name }}</span>
            </div>

            <div class="text-body-2 text-wrap-content bg-white pa-2 rounded border-sm">
              {{ parseMessage(event) }}
              
              <div v-if="String(event.event_type) === '3'" class="mt-2 pt-2 border-t text-grey-darken-2">
                <div>수신: {{ parseNotificationData(event.string_kr).number }}</div>
                <div>이름: {{ parseNotificationData(event.string_kr).name }}</div>
              </div>
            </div>
          </v-card>
        </template>
        <div v-else class="text-center py-8 text-grey">
          이벤트 없음
        </div>
      </div>

      <v-table
        v-else
        :density="isDashboard ? 'compact' : 'default'"
        class="event-table sticky-header"
        hover
        fixed-header
      >
        <thead>
          <tr>
            <th v-if="!isDashboard" class="text-center" width="40">No.</th>
            <th class="text-center" style="min-width: 80px;">유형</th> 
            <th class="text-center" style="min-width: 90px;">시간</th>
            <th class="text-center" style="min-width: 60px;">호선</th>
            <th class="text-center" style="min-width: 70px;">탱크</th>
            </tr>
        </thead>

        <tbody>
          <template v-if="hasEvents">
            <tr v-for="(event, index) in displayedEvents" :key="event.id || index">
              <td v-if="!isDashboard" class="text-center text-grey text-body-2 align-top pt-3">
                {{ index + 1 }}
              </td>

              <td class="text-center align-top pt-3">
                <div 
                  class="text-body-2 font-weight-bold text-wrap-cell mx-auto"
                  :class="getStatusTextColor(event.string_kr)"
                >
                  {{ event.string_kr }}
                </div>
              </td>

              <td class="text-center text-body-2 align-top pt-3 text-medium-emphasis">
                <div v-html="formatDateTimeBreak(event.rgst_dt)"></div>
              </td>

              <td class="text-center text-body-2 align-top pt-3">{{ event.ship_no }}</td>

              <td class="text-center text-body-2 align-top pt-3 text-wrap-cell">
                {{ event.tank_name }}
              </td>
            </tr>
          </template>

          <tr v-else>
            <td :colspan="isDashboard ? 5 : 6" class="text-center py-8 text-grey">
              <v-icon icon="mdi-alert-circle-outline" size="large" class="mb-2" />
              <div>내역 없음</div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <VPagination
        v-if="!isDashboard && pageCount > 1"
        v-model="currentPage"
        :length="pageCount"
        :total-visible="7"
        class="mt-2"
        @update:modelValue="onPageChange"
      />
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps({
  events: { type: Array, default: () => [] },
  caller: { type: String, default: '' },
})

const { smAndDown } = useDisplay()
const isDashboard = computed(() => props.caller === 'dashboard')
const hasEvents = computed(() => props.events && props.events.length > 0)

const currentPage = ref(1)
const itemsPerPage = ref(20)

const baseEvents = computed(() => {
  const arr = props.events ?? []
  return isDashboard.value ? arr.slice(0, 10) : arr
})


const totalCount = computed(() => baseEvents.value.length)

const pageCount = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / itemsPerPage.value))
)

// 임시조치 251224_HJS
const displayedEvents = computed(() => {
  /*
  if (isDashboard.value && props.events) {
    return props.events.slice(0, 10)
  }
  return props.events
  */

  if (isDashboard.value) return baseEvents.value

  const start = (currentPage.value - 1) * itemsPerPage.value
  return baseEvents.value.slice(start, start + itemsPerPage.value)
})

const onPageChange = (p) => {
  currentPage.value = p
}

const getStatusTextColor = (statusStr) => {
  if (!statusStr) return 'text-grey'
  if (statusStr.includes('완료')) return 'text-success'
  if (statusStr.includes('중단')) return 'text-error'
  if (statusStr.includes('시작')) return 'text-info'
  if (statusStr.includes('알림')) return 'text-warning'
  return 'text-grey-darken-1'
}

const formatDateTimeBreak = (dtStr) => {
  if (!dtStr) return '-'
  return dtStr.replace(' ', '<br>')
}

const parseMessage = (event) => {
  if (String(event.event_type) === '3') {
    return event.string_kr.split(',')[0]
  }
  if (isDashboard.value) return `${event.string_kr}으로 변경`
  return event.string_kr
}

const parseNotificationData = (rawString) => {
  if (!rawString) return { number: '-', name: '-' }
  const numberMatch = rawString.match(/receivingNumber:\s*([^,]+)/i)
  const nameMatch = rawString.match(/addressee:\s*([^,]+)/i)
  return {
    number: numberMatch ? numberMatch[1].trim() : '-',
    name: nameMatch ? nameMatch[1].trim() : '-',
  }
}

// 필터/데이터 바뀌면 1페이지로 리셋
watch([() => props.events, isDashboard], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.text-wrap-cell {
  white-space: normal !important;
  word-break: keep-all; 
  line-height: 1.4;
}

.text-wrap-content {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

.event-table :deep(td) {
  vertical-align: top !important;
  height: auto !important;
}

.sticky-header :deep(th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 1px 0 rgba(0,0,0,0.12);
}

.border-sm {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>