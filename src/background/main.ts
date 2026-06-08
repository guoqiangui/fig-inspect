if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  import('./contentScriptHMR')
}

// @ts-expect-error missing types
browser.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: unknown) => console.error(error))

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

browser.runtime.onMessage.addListener((message: unknown) => {
  const msg = message as { type?: string, data?: any }
  if (msg.type === 'capture-visible-tab') {
    return (browser.tabs as any).captureVisibleTab(null, { format: 'png' }) as Promise<string>
  }
  if (msg.type === 'download-image') {
    const { dataUrl, filename } = msg.data || {}
    if (dataUrl && filename) {
      return (browser as any).downloads.download({
        url: dataUrl,
        filename,
        saveAs: false,
      })
    }
  }
})

browser.commands?.onCommand?.addListener(async (command: string) => {
  if (command === 'toggle-inspector') {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tabId = tabs[0]?.id
    if (tabId) {
      browser.tabs.sendMessage(tabId, { type: 'toggle-inspector', data: {} }).catch(() => {})
      try {
        const window = await browser.windows.getCurrent()
        // @ts-expect-error missing types
        await browser.sidePanel.open({ windowId: window.id })
      }
      catch {}
    }
  }
})
