<script setup lang="ts">
import type { DomPathSegment } from '~/types/inspector'

defineProps<{ path: DomPathSegment[] }>()

function segmentLabel(seg: DomPathSegment): string {
  let label = seg.tag
  if (seg.id)
    label += `#${seg.id}`
  if (seg.classes && seg.classes.length > 0)
    label += `.${seg.classes.slice(0, 2).join('.')}`
  if (seg.index)
    label += `:nth(${seg.index})`
  return label
}
</script>

<template>
  <div class="dom-path">
    <template v-for="(seg, i) in path" :key="i">
      <span class="path-segment" :title="segmentLabel(seg)">{{ segmentLabel(seg) }}</span>
      <span v-if="i < path.length - 1" class="path-sep">&gt;</span>
    </template>
  </div>
</template>

<style scoped>
.dom-path {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 10px;
  line-height: 1.6;
}
.path-segment {
  color: #6b7280;
  padding: 1px 3px;
  border-radius: 2px;
  cursor: default;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path-segment:hover {
  background: #f3f4f6;
  color: #374151;
}
.path-segment:last-child {
  color: #4f46e5;
  font-weight: 600;
}
.path-sep {
  color: #d1d5db;
}
</style>
