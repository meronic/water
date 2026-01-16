<template>
  <div
    v-if="visible"
    class="modal-overlay"
    @click.self="$emit('close')"
  >
    <div class="modal">
      <h3 class="title">
        {{ mode === 'name' ? '카메라 이름 일괄 수정' : '카메라 IP 일괄 수정' }}
      </h3>
      <p class="subtitle">
        필요한 항목만 수정하고 저장하세요.
      </p>

      <div class="list">
        <div
          v-for="(row, i) in local"
          :key="row.camIdx"
          class="row"
        >
          <!-- 왼쪽: 라벨(카메라 번호/현재 이름) -->
          <label class="name">
            #{{ row.camIdx + 1 }}
            <span v-if="mode==='name'">· 현재: {{ row.value_backup }}</span>
            <span v-else>· 이름: {{ row.value_backup }}</span>
          </label>

          <!-- 오른쪽: 입력값 (이름 또는 IP) -->
          <input
            v-model="local[i].value"
            class="input"
            :placeholder="mode==='name' ? '예) 선미 카메라' : '예) 192.168.0.10'"
          >
        </div>
      </div>

      <div class="footer">
        <button
          class="btn ghost"
          @click="$emit('close')"
        >
          취소
        </button>
        <button
          class="btn primary"
          @click="onSave"
        >
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, required: true }, // 'name' | 'ip'
  // items: [{ camIdx, label, value, readonlyLabel }]
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['save', 'close'])

const local = ref([])

watch(
  () => props.visible,
  (v) => {
    if (v) {
      // 깊은 복사 + 백업값 저장(라벨로 보여줄 현재 이름)
      local.value = (props.items || []).map(x => ({
        camIdx: x.camIdx,
        value: x.value ?? '',
        value_backup: x.readonlyLabel ?? x.label ?? `#${x.camIdx + 1}`,
      }))
    }
  },
  { immediate: true }
)

const validIP = (ip) =>
  !ip || (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split('.').every(n => Number(n) >= 0 && Number(n) <= 255)
  )

const onSave = () => {
  if (props.mode === 'ip') {
    const bad = local.value.find(x => !validIP(x.value))
    if (bad) {
      alert(`#${bad.camIdx + 1}의 IP 형식이 올바르지 않습니다.`)
      return
    }
  }
  emit('save', local.value.map(({ camIdx, value }) => ({ camIdx, value })))
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: grid; place-items: center;
  z-index: 9999;
}
.modal {
  width: 560px; max-width: calc(100vw - 40px);
  background: #fff; color: #222;
  border-radius: 12px; padding: 16px 16px 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}
.title { margin: 0 0 6px 0; font-size: 18px; }
.subtitle { margin: 0 0 12px 0; color: #666; font-size: 13px; }

.list {
  max-height: 50vh;
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 12px;
}
.row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 10px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #eee;
}
.row:last-child { border-bottom: none; }

.name { font-size: 14px; color: #333; }
.input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc; border-radius: 8px;
}

.footer { display: flex; justify-content: flex-end; gap: 8px; }
.btn { padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 1px solid #aaa; background: transparent; color: inherit; }
.btn.primary { background: #4b7cff; border-color: #4b7cff; color: #fff; }
</style>
