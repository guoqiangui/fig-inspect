import type { ElementRegistry } from './ElementRegistry'
import type { DomTreeData, DomTreeNode } from '~/types/inspector'

const MAX_CHILDREN = 50

function makeNode(el: Element, registry: ElementRegistry): DomTreeNode {
  return {
    nodeId: registry.register(el),
    tag: el.tagName.toLowerCase(),
    idAttr: el.id || '',
    classes: Array.from(el.classList),
    childCount: el.children.length,
  }
}

function capChildren(els: Element[]): Element[] {
  return els.length > MAX_CHILDREN ? els.slice(0, MAX_CHILDREN) : els
}

export function buildChildNodes(el: Element, registry: ElementRegistry): DomTreeNode[] {
  return capChildren(Array.from(el.children)).map(child => makeNode(child, registry))
}

export function buildSpineTree(selectedEl: Element, registry: ElementRegistry): DomTreeData {
  const spine: Element[] = []
  let node: Element | null = selectedEl
  while (node && node !== document.documentElement) {
    spine.unshift(node)
    node = node.parentElement
  }

  if (spine.length === 0 || spine[0]?.tagName.toLowerCase() !== 'body') {
    if (document.body && spine[0] !== document.body)
      spine.unshift(document.body)
  }

  const root = buildNodeAlongSpine(spine, 0, registry)

  return {
    root,
    selectedNodeIds: [registry.getId(selectedEl) ?? registry.register(selectedEl)],
  }
}

function buildNodeAlongSpine(
  spine: Element[],
  depth: number,
  registry: ElementRegistry,
): DomTreeNode {
  const el = spine[depth]
  const treeNode = makeNode(el, registry)

  if (depth === spine.length - 1) {
    treeNode.children = buildChildNodes(el, registry)
  }
  else {
    const nextSpineEl = spine[depth + 1]
    const children = capChildren(Array.from(el.children))
    treeNode.children = children.map((child) => {
      if (child === nextSpineEl)
        return buildNodeAlongSpine(spine, depth + 1, registry)
      return makeNode(child, registry)
    })
  }

  return treeNode
}
