import { reactive, readonly } from 'vue'
import { products as sampleProducts } from '../data/products'
import { supabase } from './supabase'

const state = reactive({
  products: supabase ? [] : sampleProducts,
  source: supabase ? 'idle' : 'sample',
  get loading() { return this.source === 'idle' || this.source === 'loading' }
})

export const catalog = readonly(state)

export async function loadCatalog() {
  if (!supabase || state.source === 'loading' || state.source === 'supabase') return

  state.source = 'loading'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,category,price,symbol,color,description')
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
