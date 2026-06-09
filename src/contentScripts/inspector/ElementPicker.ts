export type ElementPickerHoverCallback = (el: Element | null) => void
export type ElementPickerSelectCallback = (el: Element, multiSelect: boolean) => void

export class ElementPicker {
  private hoverCallback: ElementPickerHoverCallback | null = null
  private selectCallback: ElementPickerSelectCallback | null = null
  private deactivateCallback: (() => void) | null = null
  private isExtensionElement: (el: Element) => boolean
  private active = false
  private rafId = 0
  private lastMouseX = 0
  private lastMouseY = 0
  private lastHoveredElement: Element | null = null

  constructor(isExtensionElement: (el: Element) => boolean) {
    this.isExtensionElement = isExtensionElement
  }

  onHover(cb: ElementPickerHoverCallback) {
    this.hoverCallback = cb
  }

  onSelect(cb: ElementPickerSelectCallback) {
    this.selectCallback = cb
  }

  onDeactivate(cb: () => void) {
    this.deactivateCallback = cb
  }

  activate() {
    if (this.active)
      return
    this.active = true
    document.addEventListener('mousemove', this.handleMouseMove, true)
    document.addEventListener('mouseleave', this.handleMouseLeave)
    document.addEventListener('click', this.handleClick, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
    document.body.style.cursor = 'crosshair'
  }

  deactivate() {
    if (!this.active)
      return
    this.active = false
    cancelAnimationFrame(this.rafId)
    document.removeEventListener('mousemove', this.handleMouseMove, true)
    document.removeEventListener('mouseleave', this.handleMouseLeave)
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
    document.body.style.cursor = ''
    this.lastHoveredElement = null
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.lastMouseX = e.clientX
    this.lastMouseY = e.clientY
    cancelAnimationFrame(this.rafId)
    this.rafId = requestAnimationFrame(() => this.processHover())
  }

  private handleMouseLeave = () => {
    cancelAnimationFrame(this.rafId)
    if (this.lastHoveredElement !== null) {
      this.lastHoveredElement = null
      this.hoverCallback?.(null)
    }
  }

  private processHover() {
    const el = this.getElementAt(this.lastMouseX, this.lastMouseY)
    if (el === this.lastHoveredElement)
      return
    this.lastHoveredElement = el
    this.hoverCallback?.(el)
  }

  private handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    const el = this.getElementAt(e.clientX, e.clientY)
    if (el)
      this.selectCallback?.(el, e.ctrlKey || e.metaKey)
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      this.deactivateCallback?.()
    }
  }

  private getElementAt(x: number, y: number): Element | null {
    const elements = document.elementsFromPoint(x, y)
    for (const el of elements) {
      if (this.isExtensionElement(el))
        continue
      if (el === document.documentElement || el === document.body)
        continue
      if (el.tagName === 'IFRAME')
        return null
      return el
    }
    return null
  }
}
