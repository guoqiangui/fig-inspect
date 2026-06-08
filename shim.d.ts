import type { ProtocolWithReturn } from 'webext-bridge'
import type { ElementInfo, ExportResult, InspectorState } from './src/types/inspector'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'tab-prev': { title: string | undefined }
    'get-current-tab': ProtocolWithReturn<{ tabId: number }, { title?: string }>
    'toggle-inspector': { active?: boolean }
    'element-selected': { elementInfo: ElementInfo }
    'export-element': Record<string, never>
    'export-result': ExportResult
    'inspector-state': InspectorState
    'get-inspector-state': ProtocolWithReturn<Record<string, never>, InspectorState>
    'open-sidepanel': Record<string, never>
  }
}
