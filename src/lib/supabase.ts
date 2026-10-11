import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env and fill in your values.')
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
