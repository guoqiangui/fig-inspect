<script setup lang="ts">
import { ref } from 'vue'
import { activeFrameId } from '../composables/useActiveFrame'

defineProps<{
  count: number
}>()

const exporting = ref(false)
const error = ref('')

async function exportElement() {
  exporting.value = true
  error.value = ''
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    const tabId = tabs[0]?.id
    if (!tabId)
      throw new Error('No active tab')
    const result = (await browser.tabs.sendMessage(tabId, {
      type: 'export-element',
    }, { frameId: activeFrameId.value })) as any
    if (!result?.success)
      throw new Error(result?.error || 'Export failed')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Export failed'
  }
  finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="export-section">
    <button class="export-btn" :disabled="exporting" @click="exportElement">
      <span v-if="exporting">Exporting...</span>
      <span v-else>Export {{ count > 1 ? `${count} elements` : "" }} as PNG</span>
    </button>
    <div v-if="error" class="export-error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.export-section {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
}
.export-btn {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.export-btn:hover:not(:disabled) {
  background: #4338ca;
}
.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.export-error {
  margin-top: 4px;
  font-size: 11px;
  color: #ef4444;
}
</style>
