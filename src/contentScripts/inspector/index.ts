import { OverlayRenderer } from './OverlayRenderer'
import type { SelectionItem } from './OverlayRenderer'
import { ElementPicker } from './ElementPicker'
import { extractElementInfo } from './StyleExtractor'
import { captureElements, downloadDataUrl } from './ExportCapture'
import type { ElementInfo } from '~/types/inspector'

export class InspectorManager {
  private overlay = new OverlayRenderer()
  private picker: ElementPicker
  private active = false
  private selectedElements: Element[] = []
  private selectedInfos: ElementInfo[] = []
  private extensionContainerId: string
  private scrollHandler: (() => void) | null = null
  private resizeHandler: (() => void) | null = null

  constructor(extensionContainerId: string) {
    this.extensionContainerId = extensionContainerId
    this.picker = new ElementPicker(el => this.isExtensionElement(el))
    this.picker.onHover(el => this.handleHover(el))
    this.picker.onSelect((el, multi) => this.handleSelect(el, multi))
    this.picker.onDeactivate(() => this.deactivate())
    this.setupMessages()
  }

  toggle(forceState?: boolean) {
    const next = forceState ?? !this.active
    if (next)
      this.activate()
    else
      this.deactivate()
  }

  private activate() {
    if (this.active)
      return
    this.active = true
    this.overlay.show()
    this.picker.activate()
    this.bindScrollResize()
    this.broadcastState()
  }

  private deactivate() {
    if (!this.active)
      return
    this.active = false
    this.selectedElements = []
    this.selectedInfos = []
    this.overlay.hide()
    this.picker.deactivate()
    this.unbindScrollResize()
    this.broadcastState()
  }

  private handleHover(el: Element) {
    const rect = el.getBoundingClientRect()
    this.overlay.updateHover({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    })
  }

  private handleSelect(el: Element, multiSelect: boolean) {
    if (multiSelect) {
      const idx = this.selectedElements.indexOf(el)
      if (idx >= 0) {
        this.selectedElements.splice(idx, 1)
        this.selectedInfos.splice(idx, 1)
      }
      else {
        this.selectedElements.push(el)
        this.selectedInfos.push(extractElementInfo(el))
      }
    }
    else {
      this.selectedElements = [el]
      this.selectedInfos = [extractElementInfo(el)]
    }

    this.overlay.updateHover(null)
    this.syncOverlaySelections()
    this.broadcastSelection()
  }

  private syncOverlaySelections() {
    const items: SelectionItem[] = this.selectedInfos.map(info => ({
      rect: info.rect,
      boxModel: info.computedStyles.boxModel,
    }))
    this.overlay.updateSelections(items)
  }

  private broadcastSelection() {
    browser.runtime.sendMessage({
      type: 'element-selected',
      data: { elements: this.selectedInfos },
    }).catch(() => {})
  }

  private refreshSelection() {
    const alive: Element[] = []
    const aliveInfos: ElementInfo[] = []
    for (const el of this.selectedElements) {
      if (el.isConnected) {
        alive.push(el)
        aliveInfos.push(extractElementInfo(el))
      }
    }
    this.selectedElements = alive
    this.selectedInfos = aliveInfos
    this.syncOverlaySelections()
  }

  private bindScrollResize() {
    let ticking = false
    const update = () => {
      this.refreshSelection()
      ticking = false
    }
    this.scrollHandler = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    this.resizeHandler = this.scrollHandler
    window.addEventListener('scroll', this.scrollHandler, true)
    window.addEventListener('resize', this.resizeHandler)
  }

  private unbindScrollResize() {
    if (this.scrollHandler)
      window.removeEventListener('scroll', this.scrollHandler, true)
    if (this.resizeHandler)
      window.removeEventListener('resize', this.resizeHandler)
    this.scrollHandler = null
    this.resizeHandler = null
  }

  private isExtensionElement(el: Element): boolean {
    const container = document.getElementById(this.extensionContainerId)
    if (container && (container === el || container.contains(el)))
      return true
    return this.overlay.isOwnElement(el)
  }

  private broadcastState() {
    browser.runtime.sendMessage({
      type: 'inspector-state',
      data: { active: this.active, hasSelection: this.selectedElements.length > 0, selectionCount: this.selectedElements.length },
    }).catch(() => {})
  }

  private setupMessages() {
    browser.runtime.onMessage.addListener((message: unknown): any => {
      const msg = message as { type?: string, data?: any }

      if (msg.type === 'toggle-inspector') {
        this.toggle(msg.data?.active)
        return Promise.resolve({ ok: true })
      }

      if (msg.type === 'export-element') {
        if (this.selectedElements.length === 0)
          return Promise.resolve({ success: false, error: 'No element selected' })

        return captureElements(this.selectedElements).then((result) => {
          if (result.success && result.dataUrl && result.filename)
            downloadDataUrl(result.dataUrl, result.filename)
          return result
        })
      }

      if (msg.type === 'get-inspector-state')
        return Promise.resolve({ active: this.active, hasSelection: this.selectedElements.length > 0, selectionCount: this.selectedElements.length })
    })
  }
}
