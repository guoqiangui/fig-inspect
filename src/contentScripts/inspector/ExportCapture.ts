import { snapdom } from '@zumer/snapdom'
import type { ExportResult } from '~/types/inspector'

export async function captureElements(els: Element[]): Promise<ExportResult> {
  if (els.length === 0)
    return { success: false, error: 'No elements selected' }

  try {
    const dpr = window.devicePixelRatio || 1
    const rects = els.map(el => el.getBoundingClientRect())

    const bboxLeft = Math.min(...rects.map(r => r.left))
    const bboxTop = Math.min(...rects.map(r => r.top))
    const bboxRight = Math.max(...rects.map(r => r.right))
    const bboxBottom = Math.max(...rects.map(r => r.bottom))

    const canvasW = Math.round((bboxRight - bboxLeft) * dpr)
    const canvasH = Math.round((bboxBottom - bboxTop) * dpr)

    const master = document.createElement('canvas')
    master.width = canvasW
    master.height = canvasH
    const ctx = master.getContext('2d')
    if (!ctx)
      throw new Error('Canvas not supported')

    for (let i = 0; i < els.length; i++) {
      const result = await snapdom(els[i] as HTMLElement, { scale: dpr })
      const elCanvas = await result.toCanvas()
      const dx = Math.round((rects[i].left - bboxLeft) * dpr)
      const dy = Math.round((rects[i].top - bboxTop) * dpr)
      ctx.drawImage(elCanvas, dx, dy)
    }

    const dataUrl = master.toDataURL('image/png')
    const tag = els[0].tagName.toLowerCase()
    const count = els.length > 1 ? `-${els.length}els` : ''
    const filename = `${tag}${count}-${Date.now()}.png`

    return { success: true, dataUrl, filename }
  }
  catch (err) {
    console.error('[fig-inspect] captureElements failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function downloadDataUrl(dataUrl: string, filename: string) {
  try {
    await browser.runtime.sendMessage({
      type: 'download-image',
      data: { dataUrl, filename },
    })
  }
  catch (err) {
    console.error('[fig-inspect] download failed:', err)
  }
}
