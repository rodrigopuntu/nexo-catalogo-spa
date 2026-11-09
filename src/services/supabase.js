import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.VUE_APP_SUPABASE_URL
export const supabasePublishableKey = process.env.VUE_APP_SUPABASE_PUBLISHABLE_KEY

export const supabase = supabaseUrl && supabasePublishableKey?.startsWith('sb_publishable_') && window.location.protocol !== 'file:'
  ? createClient(supabaseUrl, supabasePublishableKey, { auth: { flowType: 'pkce' } })
  : null
