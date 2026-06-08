export interface ElementRect {
  x: number
  y: number
  width: number
  height: number
  top: number
  left: number
  right: number
  bottom: number
}

export interface BoxSides {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BoxModelData {
  margin: BoxSides
  border: BoxSides
  padding: BoxSides
  content: { width: number, height: number }
}

export interface LayoutStyles {
  position: string
  display: string
  width: string
  height: string
  top: string
  left: string
  right: string
  bottom: string
  zIndex: string
  flexDirection: string
  justifyContent: string
  alignItems: string
  gap: string
  gridTemplateColumns: string
  gridTemplateRows: string
}

export interface TypographyStyles {
  fontFamily: string
  fontSize: string
  fontWeight: string
  fontStyle: string
  color: string
  lineHeight: string
  letterSpacing: string
  textAlign: string
  textDecoration: string
  textTransform: string
  whiteSpace: string
  wordBreak: string
}

export interface FillStyles {
  backgroundColor: string
  backgroundImage: string
  background: string
}

export interface BorderStyles {
  borderTopWidth: string
  borderRightWidth: string
  borderBottomWidth: string
  borderLeftWidth: string
  borderTopColor: string
  borderRightColor: string
  borderBottomColor: string
  borderLeftColor: string
  borderTopStyle: string
  borderRightStyle: string
  borderBottomStyle: string
  borderLeftStyle: string
  borderTopLeftRadius: string
  borderTopRightRadius: string
  borderBottomRightRadius: string
  borderBottomLeftRadius: string
}

export interface EffectStyles {
  boxShadow: string
  opacity: string
  overflow: string
  overflowX: string
  overflowY: string
  transform: string
  filter: string
  mixBlendMode: string
  cursor: string
}

export interface ComputedStyleData {
  layout: LayoutStyles
  boxModel: BoxModelData
  typography: TypographyStyles
  fill: FillStyles
  border: BorderStyles
  effects: EffectStyles
}

export interface DomPathSegment {
  tag: string
  id?: string
  classes?: string[]
  index?: number
}

export interface ElementInfo {
  tagName: string
  id: string
  classNames: string[]
  attributes: Record<string, string>
  domPath: DomPathSegment[]
  rect: ElementRect
  computedStyles: ComputedStyleData
  parentRect: ElementRect | null
  textContent: string
}

export interface ExportResult {
  success: boolean
  dataUrl?: string
  filename?: string
  error?: string
}

export interface InspectorState {
  active: boolean
  hasSelection: boolean
}
