<script setup lang="ts">
import CopyableValue from './CopyableValue.vue'
import type { ElementInfo } from '~/types/inspector'

defineProps<{ info: ElementInfo }>()
</script>

<template>
  <div class="header-section">
    <div class="tag-line">
      <span class="tag-name">&lt;{{ info.tagName }}&gt;</span>
      <span v-if="info.id" class="el-id">#{{ info.id }}</span>
    </div>
    <div v-if="info.classNames.length > 0" class="classes-line">
      <span v-for="cls in info.classNames" :key="cls" class="class-badge">
        <CopyableValue :value="cls" />
      </span>
    </div>
    <div class="dims-line">
      {{ Math.round(info.rect.width) }} × {{ Math.round(info.rect.height) }}
    </div>
  </div>
</template>

<style scoped>
.header-section {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}
.tag-line {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.tag-name {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 14px;
  font-weight: 700;
  color: #7c3aed;
}
.el-id {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: #2563eb;
}
.classes-line {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 4px;
}
.class-badge {
  font-size: 10px;
  background: #f3f4f6;
  border-radius: 3px;
  padding: 0 2px;
}
.dims-line {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: #6b7280;
}
</style>
