import type { BoxModelData, ElementRect } from '~/types/inspector'

const HOVER_COLOR = 'rgba(79, 70, 229, 0.1)'
const HOVER_BORDER = 'rgba(79, 70, 229, 0.8)'
const SELECT_BORDER = '#4F46E5'
const MARGIN_COLOR = 'rgba(249, 115, 22, 0.3)'
const PADDING_COLOR = 'rgba(34, 197, 94, 0.3)'
const LABEL_BG = '#4F46E5'
const LABEL_COLOR = '#fff'

function computeMaxZIndex(): number {
  let max = 0
  const elements = Array.from(document.querySelectorAll('*'))
  for (const el of elements) {
    const z = Number.parseInt(window.getComputedStyle(el).zIndex, 10)
    if (!Number.isNaN(z) && z > max)
      max = z
  }
  return max + 1
}

function applyStyle(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles)
}

function createDiv(): HTMLDivElement {
  return document.createElement('div')
}

export interface SelectionItem {
  rect: ElementRect
  boxModel?: BoxModelData
}

export class OverlayRenderer {
  private container: HTMLDivElement | null = null
  private hoverOverlay: HTMLDivElement | null = null
  private hoverLabel: HTMLDivElement | null = null
  private selectPool: { box: HTMLDivElement, label: HTMLDivElement }[] = []
  private marginOverlays: HTMLDivElement[] = []
  private paddingOverlays: HTMLDivElement[] = []

  show() {
    if (this.container)
      return
    this.container = createDiv()
    const zIndex = String(computeMaxZIndex())
    applyStyle(this.container, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex,
    })
    this.container.setAttribute('data-fig-inspect-overlay', '')

    this.hoverOverlay = this.createOverlayBox()
    this.hoverLabel = this.createLabel()
    this.createBoxModelOverlays()

    this.container.appendChild(this.hoverOverlay)
    this.container.appendChild(this.hoverLabel)
    for (const o of [...this.marginOverlays, ...this.paddingOverlays])
      this.container.appendChild(o)

    document.documentElement.appendChild(this.container)
  }

  hide() {
    this.container?.remove()
    this.container = null
    this.hoverOverlay = null
    this.hoverLabel = null
    this.selectPool = []
    this.marginOverlays = []
    this.paddingOverlays = []
  }

  updateHover(rect: ElementRect | null) {
    if (!this.hoverOverlay || !this.hoverLabel)
      return
    if (!rect) {
      this.hoverOverlay.style.display = 'none'
      this.hoverLabel.style.display = 'none'
      return
    }
    this.positionBox(this.hoverOverlay, rect, {
      background: HOVER_COLOR,
      border: `1px solid ${HOVER_BORDER}`,
    })
    this.positionLabel(this.hoverLabel, rect)
  }

  updateSelections(items: SelectionItem[]) {
    if (!this.container)
      return
    if (items.length === 0) {
      for (const entry of this.selectPool) {
        entry.box.style.display = 'none'
        entry.label.style.display = 'none'
      }
      this.hideBoxModel()
      return
    }

    while (this.selectPool.length < items.length) {
      const box = this.createOverlayBox()
      const label = this.createLabel()
      this.container.appendChild(box)
      this.container.appendChild(label)
      this.selectPool.push({ box, label })
    }

    for (let i = 0; i < this.selectPool.length; i++) {
      const entry = this.selectPool[i]
      if (i < items.length) {
        const item = items[i]
        this.positionBox(entry.box, item.rect, {
          background: 'transparent',
          border: `2px solid ${SELECT_BORDER}`,
        })
        this.positionLabel(entry.label, item.rect)
      }
      else {
        entry.box.style.display = 'none'
        entry.label.style.display = 'none'
      }
    }

    const last = items[items.length - 1]
    if (last.boxModel)
      this.updateBoxModel(last.rect, last.boxModel)
    else
      this.hideBoxModel()
  }

  private createOverlayBox(): HTMLDivElement {
    const box = createDiv()
    applyStyle(box, {
      position: 'fixed',
      pointerEvents: 'none',
      display: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.05s ease-out',
    })
    return box
  }

  private createLabel(): HTMLDivElement {
    const label = createDiv()
    applyStyle(label, {
      position: 'fixed',
      pointerEvents: 'none',
      display: 'none',
      background: LABEL_BG,
      color: LABEL_COLOR,
      fontSize: '11px',
      fontFamily: 'monospace',
      padding: '2px 6px',
      borderRadius: '3px',
      whiteSpace: 'nowrap',
      lineHeight: '1.4',
    })
    return label
  }

  private createBoxModelOverlays() {
    for (let i = 0; i < 4; i++) {
      const margin = createDiv()
      applyStyle(margin, {
        position: 'fixed',
        pointerEvents: 'none',
        display: 'none',
        background: MARGIN_COLOR,
      })
      this.marginOverlays.push(margin)

      const padding = createDiv()
      applyStyle(padding, {
        position: 'fixed',
        pointerEvents: 'none',
        display: 'none',
        background: PADDING_COLOR,
      })
      this.paddingOverlays.push(padding)
    }
  }

  private positionBox(box: HTMLDivElement, rect: ElementRect, extra: Partial<CSSStyleDeclaration>) {
    applyStyle(box, {
      display: 'block',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      ...extra,
    })
  }

  private positionLabel(label: HTMLDivElement, rect: ElementRect) {
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    label.textContent = `${w} × ${h}`
    label.style.display = 'block'

    const labelTop = rect.bottom + 4
    const overflowBottom = labelTop + 20 > window.innerHeight
    label.style.top = overflowBottom ? `${rect.top - 22}px` : `${labelTop}px`
    label.style.left = `${rect.left}px`
  }

  private updateBoxModel(rect: ElementRect, bm: BoxModelData) {
    this.positionBoxModelSide(this.marginOverlays[0], {
      top: rect.top - bm.margin.top,
      left: rect.left - bm.margin.left,
      width: rect.width + bm.margin.left + bm.margin.right,
      height: bm.margin.top,
    }, MARGIN_COLOR)
    this.positionBoxModelSide(this.marginOverlays[1], {
      top: rect.bottom,
      left: rect.left - bm.margin.left,
      width: rect.width + bm.margin.left + bm.margin.right,
      height: bm.margin.bottom,
    }, MARGIN_COLOR)
    this.positionBoxModelSide(this.marginOverlays[2], {
      top: rect.top,
      left: rect.left - bm.margin.left,
      width: bm.margin.left,
      height: rect.height,
    }, MARGIN_COLOR)
    this.positionBoxModelSide(this.marginOverlays[3], {
      top: rect.top,
      left: rect.right,
      width: bm.margin.right,
      height: rect.height,
    }, MARGIN_COLOR)

    const bTop = bm.border.top
    const bRight = bm.border.right
    const bBottom = bm.border.bottom
    const bLeft = bm.border.left
    const innerLeft = rect.left + bLeft
    const innerTop = rect.top + bTop
    const innerWidth = rect.width - bLeft - bRight
    const innerHeight = rect.height - bTop - bBottom

    this.positionBoxModelSide(this.paddingOverlays[0], {
      top: innerTop,
      left: innerLeft,
      width: innerWidth,
      height: bm.padding.top,
    }, PADDING_COLOR)
    this.positionBoxModelSide(this.paddingOverlays[1], {
      top: innerTop + innerHeight - bm.padding.bottom,
      left: innerLeft,
      width: innerWidth,
      height: bm.padding.bottom,
    }, PADDING_COLOR)
    this.positionBoxModelSide(this.paddingOverlays[2], {
      top: innerTop + bm.padding.top,
      left: innerLeft,
      width: bm.padding.left,
      height: innerHeight - bm.padding.top - bm.padding.bottom,
    }, PADDING_COLOR)
    this.positionBoxModelSide(this.paddingOverlays[3], {
      top: innerTop + bm.padding.top,
      left: innerLeft + innerWidth - bm.padding.right,
      width: bm.padding.right,
      height: innerHeight - bm.padding.top - bm.padding.bottom,
    }, PADDING_COLOR)
  }

  private positionBoxModelSide(el: HTMLDivElement | undefined, dims: { top: number, left: number, width: number, height: number }, color: string) {
    if (!el)
      return
    if (dims.width <= 0 || dims.height <= 0) {
      el.style.display = 'none'
      return
    }
    applyStyle(el, {
      display: 'block',
      top: `${dims.top}px`,
      left: `${dims.left}px`,
      width: `${dims.width}px`,
      height: `${dims.height}px`,
      background: color,
    })
  }

  private hideBoxModel() {
    for (const o of [...this.marginOverlays, ...this.paddingOverlays])
      o.style.display = 'none'
  }

  isOwnElement(el: Element): boolean {
    if (!this.container)
      return false
    return this.container === el || this.container.contains(el)
  }
}
