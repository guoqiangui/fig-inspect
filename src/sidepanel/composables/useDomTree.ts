import { onMounted, onUnmounted, ref } from 'vue'
import type { DomTreeNode } from '~/types/inspector'

export function useDomTree() {
  const treeRoot = ref<DomTreeNode | null>(null)
  const selectedNodeIds = ref<number[]>([])

  function listener(message: unknown): undefined {
    const msg = message as { type?: string, data?: any }
    if (msg.type === 'dom-tree-data') {
      treeRoot.value = msg.data.tree.root
      selectedNodeIds.value = msg.data.tree.selectedNodeIds
    }
    else if (msg.type === 'inspector-state') {
      if (!msg.data.hasSelection) {
        treeRoot.value = null
        selectedNodeIds.value = []
      }
    }
    return undefined
  }

  async function getActiveTabId(): Promise<number | undefined> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    return tabs[0]?.id
  }

  async function selectNode(nodeId: number, multi: boolean = false) {
    const tabId = await getActiveTabId()
    if (!tabId)
      return
    await browser.tabs.sendMessage(tabId, {
      type: 'dom-tree-select-node',
      data: { nodeId, multi },
    })
  }

  async function expandNode(nodeId: number) {
    const tabId = await getActiveTabId()
    if (!tabId)
      return
    const response = await browser.tabs.sendMessage(tabId, {
      type: 'dom-tree-expand-node',
      data: { nodeId },
    }) as { children: DomTreeNode[] }

    if (response?.children && treeRoot.value) {
      const target = findNodeById(treeRoot.value, nodeId)
      if (target)
        target.children = response.children
    }
  }

  function collapseNode(nodeId: number) {
    if (!treeRoot.value)
      return
    const target = findNodeById(treeRoot.value, nodeId)
    if (target)
      target.children = undefined
  }

  async function hoverNode(nodeId: number | null) {
    const tabId = await getActiveTabId()
    if (!tabId)
      return
    await browser.tabs.sendMessage(tabId, {
      type: 'dom-tree-hover-node',
      data: { nodeId },
    }).catch(() => {})
  }

  onMounted(() => {
    browser.runtime.onMessage.addListener(listener)
  })

  onUnmounted(() => {
    browser.runtime.onMessage.removeListener(listener)
  })

  return { treeRoot, selectedNodeIds, selectNode, expandNode, collapseNode, hoverNode }
}

function findNodeById(node: DomTreeNode, nodeId: number): DomTreeNode | null {
  if (node.nodeId === nodeId)
    return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, nodeId)
      if (found)
        return found
    }
  }
  return null
}
