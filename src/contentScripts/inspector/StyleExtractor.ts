import type { BorderStyles, BoxModelData, ComputedStyleData, DomPathSegment, EffectStyles, ElementInfo, ElementRect, FillStyles, LayoutStyles, TypographyStyles } from '~/types/inspector'

function getRect(el: Element): ElementRect {
  const r = el.getBoundingClientRect()
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  }
}

function parsePx(value: string): number {
  return Number.parseFloat(value) || 0
}

function extractBoxModel(cs: CSSStyleDeclaration): BoxModelData {
  const margin = {
    top: parsePx(cs.marginTop),
    right: parsePx(cs.marginRight),
    bottom: parsePx(cs.marginBottom),
    left: parsePx(cs.marginLeft),
  }
  const border = {
    top: parsePx(cs.borderTopWidth),
    right: parsePx(cs.borderRightWidth),
    bottom: parsePx(cs.borderBottomWidth),
    left: parsePx(cs.borderLeftWidth),
  }
  const padding = {
    top: parsePx(cs.paddingTop),
    right: parsePx(cs.paddingRight),
    bottom: parsePx(cs.paddingBottom),
    left: parsePx(cs.paddingLeft),
  }
  const contentWidth = parsePx(cs.width) - padding.left - padding.right - border.left - border.right
  const contentHeight = parsePx(cs.height) - padding.top - padding.bottom - border.top - border.bottom
  return {
    margin,
    border,
    padding,
    content: { width: Math.max(0, contentWidth), height: Math.max(0, contentHeight) },
  }
}

function extractLayout(cs: CSSStyleDeclaration): LayoutStyles {
  return {
    position: cs.position,
    display: cs.display,
    width: cs.width,
    height: cs.height,
    top: cs.top,
    left: cs.left,
    right: cs.right,
    bottom: cs.bottom,
    zIndex: cs.zIndex,
    flexDirection: cs.flexDirection,
    justifyContent: cs.justifyContent,
    alignItems: cs.alignItems,
    gap: cs.gap,
    gridTemplateColumns: cs.gridTemplateColumns,
    gridTemplateRows: cs.gridTemplateRows,
  }
}

function extractTypography(cs: CSSStyleDeclaration): TypographyStyles {
  return {
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    color: cs.color,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    textAlign: cs.textAlign,
    textDecoration: cs.textDecoration,
    textTransform: cs.textTransform,
    whiteSpace: cs.whiteSpace,
    wordBreak: cs.wordBreak,
  }
}

function extractFill(cs: CSSStyleDeclaration): FillStyles {
  return {
    backgroundColor: cs.backgroundColor,
    backgroundImage: cs.backgroundImage,
    background: cs.background,
  }
}

function extractBorder(cs: CSSStyleDeclaration): BorderStyles {
  return {
    borderTopWidth: cs.borderTopWidth,
    borderRightWidth: cs.borderRightWidth,
    borderBottomWidth: cs.borderBottomWidth,
    borderLeftWidth: cs.borderLeftWidth,
    borderTopColor: cs.borderTopColor,
    borderRightColor: cs.borderRightColor,
    borderBottomColor: cs.borderBottomColor,
    borderLeftColor: cs.borderLeftColor,
    borderTopStyle: cs.borderTopStyle,
    borderRightStyle: cs.borderRightStyle,
    borderBottomStyle: cs.borderBottomStyle,
    borderLeftStyle: cs.borderLeftStyle,
    borderTopLeftRadius: cs.borderTopLeftRadius,
    borderTopRightRadius: cs.borderTopRightRadius,
    borderBottomRightRadius: cs.borderBottomRightRadius,
    borderBottomLeftRadius: cs.borderBottomLeftRadius,
  }
}

function extractEffects(cs: CSSStyleDeclaration): EffectStyles {
  return {
    boxShadow: cs.boxShadow,
    opacity: cs.opacity,
    overflow: cs.overflow,
    overflowX: cs.overflowX,
    overflowY: cs.overflowY,
    transform: cs.transform,
    filter: cs.filter,
    mixBlendMode: cs.mixBlendMode,
    cursor: cs.cursor,
  }
}

function buildDomPath(el: Element): DomPathSegment[] {
  const path: DomPathSegment[] = []
  let node: Element | null = el
  while (node && node !== document.documentElement) {
    const segment: DomPathSegment = { tag: node.tagName.toLowerCase() }
    if (node.id)
      segment.id = node.id
    const cls: string[] = []
    for (let i = 0; i < node.classList.length; i++) {
      const c = node.classList[i]
      if (c && c.length > 0)
        cls.push(c)
    }
    if (cls.length > 0)
      segment.classes = cls
    const par = node.parentElement as Element | null
    if (par) {
      const tag = node.tagName
      const siblings = Array.from(par.children).filter(c => c.tagName === tag)
      if (siblings.length > 1)
        segment.index = siblings.indexOf(node) + 1
    }
    path.unshift(segment)
    node = par
  }
  return path
}

function getAttributes(el: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of Array.from(el.attributes)) {
    if (attr.name !== 'class' && attr.name !== 'id' && attr.name !== 'style')
      attrs[attr.name] = attr.value
  }
  return attrs
}

export function extractElementInfo(el: Element): ElementInfo {
  const cs = window.getComputedStyle(el)
  const rect = getRect(el)
  const parentRect = el.parentElement ? getRect(el.parentElement) : null

  const computedStyles: ComputedStyleData = {
    layout: extractLayout(cs),
    boxModel: extractBoxModel(cs),
    typography: extractTypography(cs),
    fill: extractFill(cs),
    border: extractBorder(cs),
    effects: extractEffects(cs),
  }

  let textContent = ''
  if (el.childNodes.length > 0) {
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE)
        textContent += node.textContent?.trim() || ''
    }
  }
  if (textContent.length > 200)
    textContent = `${textContent.slice(0, 200)}...`

  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    classNames: Array.from(el.classList),
    attributes: getAttributes(el),
    domPath: buildDomPath(el),
    rect,
    computedStyles,
    parentRect,
    textContent,
  }
}
