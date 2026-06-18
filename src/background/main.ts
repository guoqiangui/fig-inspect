// 关闭“点击图标直接开 side panel”的默认行为，否则 Chrome 会直接开面板而不触发 onClicked。
// 该设置是持久化的，必须显式设回 false（仅删掉之前的 true 不生效）。
;(browser as any).sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {})

// 全局默认面板禁用：没点过图标的 tab 不显示面板。点过的 tab 通过 tab 级 setOptions 启用，
// 之后 Chrome 会自动「在该 tab 显示、切走隐藏、切回恢复」——这是原生行为，无需手动 onActivated 管理。
;(browser as any).sidePanel?.setOptions?.({ enabled: false }).catch(() => {})

// 与 manifest side_panel.default_path 保持一致：tab 级 setOptions 必须带 path，否则该 tab 无面板内容。
const PANEL_PATH = 'dist/sidepanel/index.html'

// 点击工具栏图标：打开侧边栏并直接启动 inspector，无需再点侧边栏的 ON 按钮
browser.action.onClicked.addListener((tab) => {
  const anyBrowser = browser as any
  if (tab.id == null)
    return

  const tabId = tab.id

  if (anyBrowser.sidePanel?.open) {
    // 关键顺序：必须「先 setOptions 启用该 tab 面板，再 open」，两者都不 await。
    //  - Chrome 按调用顺序(FIFO)处理：先入队的 setOptions 先生效，open 时面板已启用。
    //  - 不 await 才能保住用户手势（await 会跨异步丢手势，open 被拒）。
    //  - 顺序反了会报 "No active side panel for tabId"。
    anyBrowser.sidePanel.setOptions?.({ tabId, path: PANEL_PATH, enabled: true })?.catch?.(() => {})
    anyBrowser.sidePanel.open({ tabId }).catch(() => {})
  }
  else if (anyBrowser.sidebarAction?.open) {
    anyBrowser.sidebarAction.open().catch(() => {})
  }

  browser.tabs.sendMessage(tabId, { type: 'toggle-inspector', data: { active: true } }).catch(() => {})
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

browser.commands?.onCommand?.addListener((command: string, tab) => {
  if (command === 'toggle-inspector') {
    const anyBrowser = browser as any
    const tabId = tab?.id
    if (tabId == null)
      return

    // 同 onClicked：先 setOptions 后 open，都不 await。
    anyBrowser.sidePanel?.setOptions?.({ tabId, path: PANEL_PATH, enabled: true })?.catch?.(() => {})
    anyBrowser.sidePanel?.open?.({ tabId }).catch(() => {})

    browser.tabs.sendMessage(tabId, { type: 'toggle-inspector', data: {} }).catch(() => {})
  }
})
