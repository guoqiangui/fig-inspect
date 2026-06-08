<script setup lang="ts">
import CopyableValue from './CopyableValue.vue'
import SectionCollapse from './SectionCollapse.vue'
import type { FillStyles } from '~/types/inspector'

defineProps<{ fill: FillStyles }>()

function isVisible(val: string): boolean {
  return !!val && val !== 'transparent' && val !== 'rgba(0, 0, 0, 0)' && val !== 'none'
}
</script>

<template>
  <SectionCollapse title="Fill" :default-open="isVisible(fill.backgroundColor) || isVisible(fill.backgroundImage)">
    <div class="prop-grid">
      <div v-if="isVisible(fill.backgroundColor)" class="prop-row">
        <span class="prop-label">Background</span>
        <CopyableValue :value="fill.backgroundColor" color-preview />
      </div>
      <div v-if="isVisible(fill.backgroundImage)" class="prop-row">
        <span class="prop-label">Image</span>
        <CopyableValue :value="fill.backgroundImage" />
      </div>
      <div v-if="!isVisible(fill.backgroundColor) && !isVisible(fill.backgroundImage)" class="empty">
        None
      </div>
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
.empty {
  font-size: 11px;
  color: #d1d5db;
  padding: 2px 0;
}
</style>
