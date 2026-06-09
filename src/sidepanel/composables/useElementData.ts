import { computed, onMounted, onUnmounted, ref } from 'vue'
import { activeFrameId } from './useActiveFrame'
import type { ElementInfo } from '~/types/inspector'

export function useElementData() {
  const selectedElements = ref<ElementInfo[]>([])
  const activeIndex = ref(0)
  const connected = ref(false)

  const activeElement = computed(() => {
    if (selectedElements.value.length === 0)
      return null
    const idx = Math.min(activeIndex.value, selectedElements.value.length - 1)
    return selectedElements.value[idx] || null
  })

  function setActiveIndex(idx: number) {
    activeIndex.value = idx
  }

  function listener(message: unknown, sender: any, _sendResponse: any): undefined {
    const msg = message as { type?: string, data?: any }
    if (msg.type === 'element-selected') {
      const newFrameId = sender?.frameId ?? 0
      const tabId = sender?.tab?.id
      if (newFrameId !== activeFrameId.value && tabId != null) {
        browser.tabs.sendMessage(tabId, { type: 'clear-selection' }, { frameId: activeFrameId.value }).catch(() => {})
      }
      activeFrameId.value = newFrameId
      const elements = msg.data.elements as ElementInfo[]
      selectedElements.value = elements
      if (activeIndex.value >= elements.length)
        activeIndex.value = Math.max(0, elements.length - 1)
      connected.value = true
    }
    else if (msg.type === 'inspector-state') {
      connected.value = msg.data.active
      if (!msg.data.hasSelection) {
        selectedElements.value = []
        activeIndex.value = 0
      }
    }
    return undefined
  }

  async function queryCurrentTab() {
    selectedElements.value = []
    activeIndex.value = 0
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      const tabId = tabs[0]?.id
      if (!tabId)
        return
      const state = await browser.tabs.sendMessage(tabId, { type: 'get-inspector-state' }) as any
      connected.value = !!state?.active
    }
    catch {
      connected.value = false
    }
  }

  function onTabActivated() {
    queryCurrentTab()
  }

  onMounted(() => {
    browser.runtime.onMessage.addListener(listener)
    browser.tabs.onActivated.addListener(onTabActivated)
  })

  onUnmounted(() => {
    browser.runtime.onMessage.removeListener(listener)
    browser.tabs.onActivated.removeListener(onTabActivated)
  })

  return { selectedElements, activeElement, activeIndex, setActiveIndex, connected }
}
