// 关闭“点击图标直接开 side panel”的默认行为，否则 Chrome 会直接开面板而不触发 onClicked。
// 该设置是持久化的，必须显式设回 false（仅删掉之前的 true 不生效）。
;(browser as any).sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {})

// 点击工具栏图标：打开侧边栏并直接启动 inspector，无需再点侧边栏的 ON 按钮
browser.action.onClicked.addListener((tab) => {
  const anyBrowser = browser as any

  // 打开侧边栏必须在用户手势内同步调用，不能放在 await 之后
  if (anyBrowser.sidePanel?.open)
    anyBrowser.sidePanel.open({ windowId: tab.windowId }).catch(() => {})
  else if (anyBrowser.sidebarAction?.open)
    anyBrowser.sidebarAction.open().catch(() => {})

  if (tab.id != null)
    browser.tabs.sendMessage(tab.id, { type: 'toggle-inspector', data: { active: true } }).catch(() => {})
})

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
