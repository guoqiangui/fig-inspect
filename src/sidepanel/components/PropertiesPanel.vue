<script setup lang="ts">
import { ref } from 'vue'
import { useElementData } from '../composables/useElementData'
import HeaderSection from './HeaderSection.vue'
import LayoutSection from './LayoutSection.vue'
import BoxModelDiagram from './BoxModelDiagram.vue'
import TypographySection from './TypographySection.vue'
import FillSection from './FillSection.vue'
import BorderSection from './BorderSection.vue'
import EffectsSection from './EffectsSection.vue'
import DomPath from './DomPath.vue'
import ExportButton from './ExportButton.vue'
import DomTreeView from './DomTreeView.vue'

const { selectedElements, activeElement, activeIndex, setActiveIndex, connected } = useElementData()
const toggling = ref(false)

async function toggleInspector() {
  if (toggling.value)
    return
  toggling.value = true
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tabId = tabs[0]?.id
    if (!tabId)
      return
    const nextState = !connected.value
    await browser.tabs.sendMessage(tabId, { type: 'toggle-inspector', data: { active: nextState } })
    connected.value = nextState
  }
  catch {}
  finally {
    toggling.value = false
  }
}
</script>

<template>
  <div class="properties-panel">
    <!-- Toolbar -->
    <div class="toolbar">
      <span class="toolbar-title">Fig Inspect</span>
      <button
        class="toggle-btn"
        :class="{ active: connected }"
        :disabled="toggling"
        @click="toggleInspector"
      >
        <span class="dot" :class="{ active: connected }" />
        {{ connected ? 'ON' : 'OFF' }}
      </button>
    </div>

    <!-- Selection tabs -->
    <div v-if="selectedElements.length > 1" class="selection-tabs">
      <button
        v-for="(el, i) in selectedElements"
        :key="i"
        class="sel-tab"
        :class="{ active: i === activeIndex }"
        @click="setActiveIndex(i)"
      >
        {{ el.tagName }}<span v-if="el.classNames[0]" class="sel-cls">.{{ el.classNames[0] }}</span>
      </button>
    </div>

    <template v-if="activeElement">
      <HeaderSection :info="activeElement" />
      <DomTreeView />
      <LayoutSection
        :layout="activeElement.computedStyles.layout"
        :x="activeElement.rect.x"
        :y="activeElement.rect.y"
      />
      <BoxModelDiagram :box-model="activeElement.computedStyles.boxModel" />
      <TypographySection :typography="activeElement.computedStyles.typography" />
      <FillSection :fill="activeElement.computedStyles.fill" />
      <BorderSection :border="activeElement.computedStyles.border" />
      <EffectsSection :effects="activeElement.computedStyles.effects" />
      <ExportButton :count="selectedElements.length" />
      <DomPath :path="activeElement.domPath" />
    </template>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      </div>
      <div class="empty-title">
        {{ connected ? 'Click an element to inspect' : 'Inspector not active' }}
      </div>
      <div class="empty-hint">
        {{ connected ? 'Ctrl+Click to multi-select' : 'Click the toggle button above to start' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  height: 100vh;
  overflow-y: auto;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 10;
}
.toolbar-title {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.3px;
}
.toggle-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
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
.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
}
.dot.active {
  background: #34d399;
  box-shadow: 0 0 4px rgba(52, 211, 153, 0.6);
}
.selection-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.sel-tab {
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.1s;
}
.sel-tab:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}
.sel-tab.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}
.sel-cls {
  opacity: 0.7;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 45px);
  gap: 8px;
  padding: 24px;
}
.empty-icon {
  opacity: 0.5;
  margin-bottom: 8px;
}
.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}
.empty-hint {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}
</style>
