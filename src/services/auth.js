import { reactive, readonly } from 'vue'
import { supabase } from './supabase'

const oauthParams = new URLSearchParams(window.location.search)
export const returningFromGoogle = ['code', 'error', 'error_code'].some(key => oauthParams.has(key))

const state = reactive({
  configured: Boolean(supabase),
  loading: Boolean(supabase),
  user: null,
  admin: false,
  adminLoading: false,
  adminError: false,
  signInError: false
})

export const auth = readonly(state)

let adminCheck = 0

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null
    const changedUser = state.user?.id !== user?.id
    state.user = user
    state.loading = false

    if (event === 'INITIAL_SESSION' && returningFromGoogle && !user) state.signInError = true
    if (user) state.signInError = false

    if (changedUser) {
      adminCheck += 1
      state.admin = false
      state.adminError = false
      state.adminLoading = Boolean(user)
      if (user) {
        const check = adminCheck
        // Supabase's auth callback holds a lock. Query the permission after it returns.
        setTimeout(() => {
          if (check === adminCheck) checkAdmin()
        }, 0)
      }
    }
  })
}

export async function checkAdmin() {
  const userId = state.user?.id
  if (!userId) return

  const check = ++adminCheck
  state.adminLoading = true
  state.adminError = false
  try {
    const { data, error } = await supabase.from('product_admins')
      .select('user_id').eq('user_id', userId).maybeSingle()
    if (error) throw error
    if (check === adminCheck) state.admin = Boolean(data)
  } catch {
    if (check === adminCheck) {
      state.admin = false
      state.adminError = true
    }
  } finally {
    if (check === adminCheck) state.adminLoading = false
  }
}
