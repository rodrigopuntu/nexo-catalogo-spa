import { reactive, readonly } from 'vue'
import { products as sampleProducts } from '../data/products'
import { supabase } from './supabase'

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
    const { data, error } = await supabase
      .from('products')
      .select(productColumns)
      .order('id')
      .abortSignal(controller.signal)

    if (error) throw error
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
