<script setup lang="ts">
import type { DomTreeNode } from '~/types/inspector'

const props = defineProps<{
  node: DomTreeNode
  selectedIds: number[]
  depth: number
}>()

const emit = defineEmits<{
  select: [nodeId: number, multi: boolean]
  toggleExpand: [nodeId: number]
  hover: [nodeId: number | null]
}>()

const isSelected = computed(() => props.selectedIds.includes(props.node.nodeId))
const hasChildren = computed(() => props.node.childCount > 0)
const isExpanded = computed(() => !!props.node.children && props.node.children.length > 0)

function onArrowClick(e: MouseEvent) {
  e.stopPropagation()
  emit('toggleExpand', props.node.nodeId)
}

function onRowClick(e: MouseEvent) {
  emit('select', props.node.nodeId, e.ctrlKey || e.metaKey)
}

function nodeLabel(node: DomTreeNode): string {
  let label = node.tag
  if (node.idAttr)
    label += `#${node.idAttr}`
  if (node.classes.length > 0)
    label += `.${node.classes.slice(0, 2).join('.')}`
  if (node.classes.length > 2)
    label += `...`
  return label
}
</script>

<template>
  <div>
    <div
      class="tree-row"
      :class="{ selected: isSelected }"
      :style="{ paddingLeft: `${depth * 14 + 4}px` }"
      :title="nodeLabel(node)"
      @click="onRowClick"
      @mouseenter="emit('hover', node.nodeId)"
      @mouseleave="emit('hover', null)"
    >
      <span
        v-if="hasChildren"
        class="tree-arrow"
        :class="{ open: isExpanded }"
        @click="onArrowClick"
      >&#9654;</span>
      <span v-else class="tree-spacer" />
      <span class="tree-tag">{{ node.tag }}</span>
      <span v-if="node.idAttr" class="tree-id">#{{ node.idAttr }}</span>
      <template v-if="node.classes.length > 0">
        <span v-for="cls in node.classes.slice(0, 2)" :key="cls" class="tree-class">.{{ cls }}</span>
        <span v-if="node.classes.length > 2" class="tree-class">...</span>
      </template>
    </div>
    <template v-if="isExpanded && node.children">
      <DomTreeNodeRow
        v-for="child in node.children"
        :key="child.nodeId"
        :node="child"
        :selected-ids="selectedIds"
        :depth="depth + 1"
        @select="(id: number, multi: boolean) => emit('select', id, multi)"
        @toggle-expand="emit('toggleExpand', $event)"
        @hover="emit('hover', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.tree-row {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-right: 8px;
  cursor: pointer;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  line-height: 1.5;
  white-space: nowrap;
  border-left: 2px solid transparent;
}
.tree-row:hover {
  background: #f9fafb;
}
.tree-row.selected {
  background: #eef2ff;
  border-left-color: #4f46e5;
}
.tree-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 7px;
  color: #9ca3af;
  transition: transform 0.12s;
  flex-shrink: 0;
  border-radius: 2px;
}
.tree-arrow:hover {
  color: #6b7280;
  background: #e5e7eb;
}
.tree-arrow.open {
  transform: rotate(90deg);
}
.tree-spacer {
  display: inline-block;
  width: 14px;
  flex-shrink: 0;
}
.tree-tag {
  color: #7c3aed;
  font-weight: 500;
}
.tree-id {
  color: #2563eb;
}
.tree-class {
  color: #6b7280;
}
</style>
