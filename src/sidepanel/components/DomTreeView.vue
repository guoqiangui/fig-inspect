<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { useDomTree } from '../composables/useDomTree'
import SectionCollapse from './SectionCollapse.vue'
import DomTreeNodeRow from './DomTreeNodeRow.vue'

const { treeRoot, selectedNodeIds, selectNode, expandNode, collapseNode, hoverNode } = useDomTree()

const scrollContainer = ref<HTMLElement | null>(null)

function handleSelect(nodeId: number, multi: boolean) {
  selectNode(nodeId, multi)
}

function handleToggleExpand(nodeId: number) {
  if (!treeRoot.value)
    return
  const target = findNodeInTree(treeRoot.value, nodeId)
  if (!target)
    return
  if (target.children && target.children.length > 0)
    collapseNode(nodeId)
  else if (target.childCount > 0)
    expandNode(nodeId)
}

function findNodeInTree(node: any, nodeId: number): any {
  if (node.nodeId === nodeId)
    return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, nodeId)
      if (found)
        return found
    }
  }
  return null
}

watch(selectedNodeIds, async () => {
  await nextTick()
  if (!scrollContainer.value)
    return
  const selected = scrollContainer.value.querySelector('.tree-row.selected')
  if (selected)
    selected.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <SectionCollapse v-if="treeRoot" title="Elements">
    <div ref="scrollContainer" class="tree-container">
      <DomTreeNodeRow
        :node="treeRoot"
        :selected-ids="selectedNodeIds"
        :depth="0"
        @select="handleSelect"
        @toggle-expand="handleToggleExpand"
        @hover="hoverNode"
      />
    </div>
  </SectionCollapse>
</template>

<style scoped>
.tree-container {
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  margin: -4px -12px -8px;
}
.tree-container::-webkit-scrollbar {
  width: 4px;
}
.tree-container::-webkit-scrollbar-track {
  background: transparent;
}
.tree-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
</style>
