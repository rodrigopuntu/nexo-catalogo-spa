import { reactive, readonly } from 'vue'

const storageKey = 'nexo.cart.v1'
export const maxCartQuantity = 99

function parseCart(value) {
  let rows
  try { rows = JSON.parse(value) } catch { return [] }
  if (!Array.isArray(rows)) return []

  const items = new Map()
  for (const row of rows) {
    if (Number.isSafeInteger(row?.id) && row.id > 0 && Number.isInteger(row.quantity) && row.quantity > 0) {
      items.set(row.id, { id: row.id, quantity: Math.min(row.quantity, maxCartQuantity) })
    }
  }
  return [...items.values()]
}

let storage
let initialItems = []
try {
  storage = window.localStorage
  initialItems = parseCart(storage.getItem(storageKey))
} catch {
  storage = null
}

const state = reactive({
  items: initialItems,
  persistent: Boolean(storage),
  get count() { return this.items.reduce((sum, item) => sum + item.quantity, 0) }
})

export const cart = readonly(state)

window.addEventListener('storage', event => {
  if (storage && event.storageArea === storage && (event.key === storageKey || event.key === null)) {
    state.items = readCart()
  }
})

function readCart() {
  try {
    if (storage) return parseCart(storage.getItem(storageKey))
  } catch {
    storage = null
    state.persistent = false
  }
  return state.items
}

function updateQuantity(id, nextQuantity) {
  if (!Number.isSafeInteger(id) || id <= 0) return

  const items = readCart()
  const current = items.find(item => item.id === id)?.quantity ?? 0
  const quantity = Math.max(0, Math.min(nextQuantity(current), maxCartQuantity))
  const updated = items.filter(item => item.id !== id)
  if (quantity > 0) {
    const position = items.findIndex(item => item.id === id)
    updated.splice(position === -1 ? updated.length : position, 0, { id, quantity })
  }
  state.items = updated

  try {
    storage?.setItem(storageKey, JSON.stringify(updated))
  } catch {
    storage = null
    state.persistent = false
  }
}

export function changeCartQuantity(id, step) {
  if (step === 1 || step === -1) updateQuantity(id, current => current + step)
}

export function removeFromCart(id) {
  updateQuantity(id, () => 0)
}
