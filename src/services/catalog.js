import { reactive, readonly } from 'vue'
import { products as sampleProducts } from '../data/products'
import { supabase, supabasePublishableKey, supabaseUrl } from './supabase'

const state = reactive({
  products: supabase ? [] : sampleProducts,
  source: supabase ? 'idle' : 'sample',
  get loading() { return this.source === 'idle' || this.source === 'loading' }
})

export const catalog = readonly(state)
const productColumns = 'id,name,category,price,symbol,color,description'
let pendingLoad = null

export function loadCatalog() {
  if (!supabase || state.source === 'supabase') return
  if (!pendingLoad) pendingLoad = fetchCatalog().finally(() => { pendingLoad = null })
  return pendingLoad
}

async function fetchCatalog() {
  state.source = 'loading'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const endpoint = new URL('/rest/v1/products', supabaseUrl)
    endpoint.search = new URLSearchParams({ select: productColumns, order: 'id.asc' })
    const response = await fetch(endpoint, {
      headers: { apikey: supabasePublishableKey },
      signal: controller.signal,
      cache: 'no-store'
    })
    if (!response.ok) throw new Error('Error HTTP al cargar el catálogo')

    const data = await response.json()
    if (!Array.isArray(data) || !data.every(product => Number.isSafeInteger(product?.id) &&
      Number.isInteger(product.price) && product.price >= 0 &&
      ['name', 'category', 'symbol', 'color', 'description'].every(field => typeof product[field] === 'string'))) {
      throw new Error('Respuesta del catálogo inválida')
    }
    state.products = data
    state.source = 'supabase'
  } catch {
    state.products = sampleProducts
    state.source = 'fallback'
  } finally {
    clearTimeout(timeout)
  }
}

export async function saveProduct(product, id) {
  const table = supabase.from('products')
  const request = id == null ? table.insert(product) : table.update(product).eq('id', id)
  const { data, error } = await request.select(productColumns).single()
  if (error) throw error

  state.products = [...state.products.filter(item => item.id !== data.id), data]
    .sort((a, b) => a.id - b.id)
  return data
}

export async function deleteProduct(id) {
  const { data, error } = await supabase.from('products').delete()
    .eq('id', id).select('id').single()
  if (error) throw error

  state.products = state.products.filter(product => product.id !== data.id)
}
