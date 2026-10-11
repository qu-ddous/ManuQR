// Database types matching Supabase schema

export type UserRole = 'shop_owner' | 'admin'
export type ShopStatus = 'pending' | 'active' | 'paused'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Shop {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  whatsapp_number: string | null
  address: string | null
  opening_hours: string | null
  currency_code: string
  status: ShopStatus
  plan_name: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  shop_id: string
  name: string
  sort_order: number
  is_visible: boolean
  created_at: string
}

export interface Product {
  id: string
  shop_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Extended / joined types
export interface ProductWithCategory extends Product {
  categories?: Category | null
}

export interface ShopWithOwner extends Shop {
  profiles?: Profile | null
}

