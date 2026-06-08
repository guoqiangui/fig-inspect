<script setup lang="ts">
import CopyableValue from './CopyableValue.vue'
import SectionCollapse from './SectionCollapse.vue'
import type { LayoutStyles } from '~/types/inspector'

defineProps<{ layout: LayoutStyles, x: number, y: number }>()
</script>

<template>
  <SectionCollapse title="Layout">
    <div class="prop-grid">
      <div class="prop-row">
        <span class="prop-label">Position</span>
        <CopyableValue :value="layout.position" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Display</span>
        <CopyableValue :value="layout.display" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Width</span>
        <CopyableValue :value="layout.width" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Height</span>
        <CopyableValue :value="layout.height" />
      </div>
      <div class="prop-row">
        <span class="prop-label">X</span>
        <CopyableValue :value="String(Math.round(x))" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Y</span>
        <CopyableValue :value="String(Math.round(y))" />
      </div>
      <template v-if="layout.position !== 'static'">
        <div v-if="layout.top !== 'auto'" class="prop-row">
          <span class="prop-label">Top</span>
          <CopyableValue :value="layout.top" />
        </div>
        <div v-if="layout.left !== 'auto'" class="prop-row">
          <span class="prop-label">Left</span>
          <CopyableValue :value="layout.left" />
        </div>
        <div v-if="layout.right !== 'auto'" class="prop-row">
          <span class="prop-label">Right</span>
          <CopyableValue :value="layout.right" />
        </div>
        <div v-if="layout.bottom !== 'auto'" class="prop-row">
          <span class="prop-label">Bottom</span>
          <CopyableValue :value="layout.bottom" />
        </div>
      </template>
      <div v-if="layout.zIndex !== 'auto'" class="prop-row">
        <span class="prop-label">Z-Index</span>
        <CopyableValue :value="layout.zIndex" />
      </div>
      <template v-if="layout.display.includes('flex')">
        <div class="prop-row">
          <span class="prop-label">Direction</span>
          <CopyableValue :value="layout.flexDirection" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Justify</span>
          <CopyableValue :value="layout.justifyContent" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Align</span>
          <CopyableValue :value="layout.alignItems" />
        </div>
        <div v-if="layout.gap !== 'normal'" class="prop-row">
          <span class="prop-label">Gap</span>
          <CopyableValue :value="layout.gap" />
        </div>
      </template>
      <template v-if="layout.display.includes('grid')">
        <div class="prop-row">
          <span class="prop-label">Columns</span>
          <CopyableValue :value="layout.gridTemplateColumns" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Rows</span>
          <CopyableValue :value="layout.gridTemplateRows" />
        </div>
      </template>
    </div>
  </SectionCollapse>
</template>

<style scoped>
.prop-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prop-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 22px;
}
.prop-label {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
  width: 70px;
}
</style>
