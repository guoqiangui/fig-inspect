<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { sendMessage } from 'webext-bridge/popup'

const active = ref(false)

async function toggleInspector() {
  const nextState = !active.value
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tabId = tabs[0]?.id
    if (!tabId)
      return
    await sendMessage('toggle-inspector', { active: nextState }, { context: 'content-script', tabId })
    active.value = nextState
    if (nextState)
      await sendMessage('open-sidepanel', {}, 'background')
  }
  catch {}
}

function listener(message: unknown, _sender: any, _sendResponse: any): undefined {
  const msg = message as { type?: string, data?: any }
  if (msg.type === 'inspector-state')
    active.value = msg.data.active
  return undefined
}

onMounted(() => {
  browser.runtime.onMessage.addListener(listener)
})

onUnmounted(() => {
  browser.runtime.onMessage.removeListener(listener)
})
</script>

<template>
  <main class="w-[280px] px-4 py-4 text-center">
    <div class="logo-area">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="active ? 'text-indigo-500' : 'text-gray-400'">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    </div>
    <h1 class="text-sm font-semibold text-gray-700 mt-2">
      Fig Inspect
    </h1>
    <p class="text-xs text-gray-400 mt-1">
      Figma-style element inspector
    </p>
    <button
      class="toggle-btn mt-4"
      :class="{ active }"
      @click="toggleInspector"
    >
      <span v-if="active" class="flex items-center justify-center gap-1.5">
        <span class="dot active" />
        Inspector ON
      </span>
      <span v-else class="flex items-center justify-center gap-1.5">
        <span class="dot" />
        Start Inspector
      </span>
    </button>
    <div class="mt-3 text-xs text-gray-400">
      Shortcut: Alt+Shift+I
    </div>
  </main>
</template>

<style scoped>
.logo-area {
  display: flex;
  justify-content: center;
}
.toggle-btn {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}
.toggle-btn:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}
.toggle-btn.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}
.toggle-btn.active:hover {
  background: #4338ca;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}
.dot.active {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
}
</style>
