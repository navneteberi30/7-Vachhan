import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('⚠️  Supabase env vars not set — app will run in demo mode with static data.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL)
