import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image_url: string | null
}

interface CartStore {
  shopSlug: string | null
  currency: string
  items: CartItem[]
  setShop: (slug: string, currency: string) => void
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      shopSlug: null,
      currency: 'PKR',
      items: [],

      setShop(slug, currency) {
        // Clear cart when switching shops
        const current = get().shopSlug
        if (current && current !== slug) {
          set({ shopSlug: slug, currency, items: [] })
        } else {
          set({ shopSlug: slug, currency })
        }
      },

      addItem(item) {
        const items = get().items
        const existing = items.find((i) => i.id === item.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, qty: 1 }] })
        }
      },

      removeItem(id) {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQty(id, qty) {
        if (qty <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, qty } : i
            ),
          })
        }
      },

      clearCart() {
        set({ items: [], shopSlug: null })
      },

      totalItems() {
        return get().items.reduce((s, i) => s + i.qty, 0)
      },

      subtotal() {
        return get().items.reduce((s, i) => s + i.price * i.qty, 0)
      },
    }),
    {
      name: 'menuqr-cart',
    }
  )
)

