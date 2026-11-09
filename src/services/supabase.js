import { createClient } from '@supabase/supabase-js'

const url = process.env.VUE_APP_SUPABASE_URL
const key = process.env.VUE_APP_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key?.startsWith('sb_publishable_') && window.location.protocol !== 'file:'
  ? createClient(url, key, { auth: { flowType: 'pkce' } })
  : null
