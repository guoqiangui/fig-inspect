export class ElementRegistry {
  private nextId = 1
  private idToRef = new Map<number, WeakRef<Element>>()
  private elToId = new WeakMap<Element, number>()

  register(el: Element): number {
    const existing = this.elToId.get(el)
    if (existing !== undefined)
      return existing
    const id = this.nextId++
    this.idToRef.set(id, new WeakRef(el))
    this.elToId.set(el, id)
    return id
  }

  getElement(id: number): Element | null {
    const ref = this.idToRef.get(id)
    if (!ref)
      return null
    const el = ref.deref()
    if (!el || !el.isConnected) {
      this.idToRef.delete(id)
      return null
    }
    return el
  }

  getId(el: Element): number | undefined {
    return this.elToId.get(el)
  }

  clear() {
    this.idToRef.clear()
    this.elToId = new WeakMap()
    this.nextId = 1
  }
}
