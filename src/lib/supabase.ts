import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
)

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[MenuQR] Supabase credentials not fully configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STORAGE_BUCKET = 'shop-assets'

/** Build a public storage URL for a given path */
export function getStorageUrl(path: string | null): string | null {
  if (!path) return null
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Build the public menu URL for a given shop slug */
export function getMenuUrl(slug: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  return `${base}/menu/${slug}`
}

