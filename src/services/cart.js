import { reactive, readonly } from 'vue'

const storageKey = 'nexo.cart.v2'
const previousStorageKey = 'nexo.cart.v1'
export const maxCartQuantity = 99

function parseItems(rows) {
  if (!Array.isArray(rows)) return []

  const items = new Map()
  for (const row of rows) {
    if (Number.isSafeInteger(row?.id) && row.id > 0 && Number.isInteger(row.quantity) && row.quantity > 0) {
      items.set(row.id, { id: row.id, quantity: Math.min(row.quantity, maxCartQuantity) })
    }
  }
  return [...items.values()]
}

function parseCart(value) {
  let saved
  try { saved = JSON.parse(value) } catch { saved = null }

  const items = parseItems(Array.isArray(saved) ? saved : saved?.items)
  const checkouts = []
  if (Array.isArray(saved?.checkouts)) {
    for (const row of saved.checkouts) {
      const orderItems = parseItems(row?.items)
      if (typeof row?.userId === 'string' && typeof row.requestId === 'string' && orderItems.length) {
        checkouts.push({ userId: row.userId, requestId: row.requestId, items: orderItems, remaining: parseItems(row.remaining) })
      }
    }
  }
  return { items, checkouts }
}

function readStoredCart() {
  return parseCart(storage.getItem(storageKey) ?? storage.getItem(previousStorageKey))
}

let storage
let savedCart = parseCart(null)
try {
  storage = window.localStorage
  savedCart = readStoredCart()
} catch {
  storage = null
}

const state = reactive({
  ...savedCart,
  persistent: Boolean(storage),
  get count() { return this.items.reduce((sum, item) => sum + item.quantity, 0) }
})

export const cart = readonly(state)

window.addEventListener('storage', event => {
  if (storage && event.storageArea === storage && [storageKey, previousStorageKey, null].includes(event.key)) {
    Object.assign(state, readCart())
  }
})

function readCart() {
  try {
    if (storage) return readStoredCart()
  } catch {
    storage = null
    state.persistent = false
  }
  return { items: state.items, checkouts: state.checkouts }
}

function saveCart(items, checkouts) {
  // Keep only the original units still in the cart. Later additions belong to a future order.
  const quantities = new Map(items.map(item => [item.id, item.quantity]))
  const nextCart = {
    items,
    checkouts: checkouts.map(checkout => ({
      ...checkout,
      remaining: checkout.remaining.map(item => ({
        id: item.id,
        quantity: Math.min(item.quantity, quantities.get(item.id) ?? 0)
      })).filter(item => item.quantity > 0)
    }))
  }
  Object.assign(state, nextCart)
  try {
    storage?.setItem(storageKey, JSON.stringify(nextCart))
  } catch {
    storage = null
    state.persistent = false
  }
}

function updateQuantity(id, nextQuantity) {
  if (!Number.isSafeInteger(id) || id <= 0) return

  return withCartLock(() => {
    const { items, checkouts } = readCart()
    const current = items.find(item => item.id === id)?.quantity ?? 0
    const quantity = Math.max(0, Math.min(nextQuantity(current), maxCartQuantity))
    const updated = items.filter(item => item.id !== id)
    if (quantity > 0) {
      const position = items.findIndex(item => item.id === id)
      updated.splice(position === -1 ? updated.length : position, 0, { id, quantity })
    }
    saveCart(updated, checkouts)
  })
}

export function changeCartQuantity(id, step) {
  if (step === 1 || step === -1) return updateQuantity(id, current => current + step)
}

export function removeFromCart(id) {
  return updateQuantity(id, () => 0)
}

function matchesCart(items, displayedItems) {
  const quantities = new Map(displayedItems.map(item => [item.id, item.quantity]))
  return items.length === quantities.size && items.every(item => quantities.get(item.id) === item.quantity)
}

function makeRequestId() {
  if (window.crypto.randomUUID) return window.crypto.randomUUID()

  const bytes = window.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

function withCartLock(callback) {
  return window.navigator.locks?.request(storageKey, callback) ?? callback()
}

export function beginCartCheckout(userId, displayedItems, retryId) {
  return withCartLock(() => {
    const saved = readCart()
    Object.assign(state, saved)
    const { items, checkouts } = saved
    const existing = checkouts.find(checkout => checkout.userId === userId)
    if (retryId) return existing?.requestId === retryId ? existing : null
    if (!items.length || !matchesCart(items, displayedItems)) return null
    if (existing) return matchesCart(existing.items, items) ? existing : null

    const checkout = { userId, requestId: makeRequestId(), items, remaining: items }
    saveCart(items, [...checkouts, checkout])
    return checkout
  })
}

export function finishCartCheckout(userId, requestId, placed) {
  return withCartLock(() => {
    const { items, checkouts } = readCart()
    const checkout = checkouts.find(row => row.userId === userId && row.requestId === requestId)
    if (!checkout) return

    const ordered = new Map(checkout.remaining.map(item => [item.id, item.quantity]))
    const available = placed
      ? items.map(item => ({ id: item.id, quantity: item.quantity - (ordered.get(item.id) ?? 0) })).filter(item => item.quantity > 0)
      : items
    saveCart(available, checkouts.filter(row => row !== checkout))
  })
}
