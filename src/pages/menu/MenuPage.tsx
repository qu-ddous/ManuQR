import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, X, MapPin, Clock, QrCode } from 'lucide-react'
import { supabase, getStorageUrl } from '@/lib/supabase'
import { useCartStore, type CartItem } from '@/features/cart/useCartStore'
import { formatPrice, buildWhatsAppLink, buildOrderMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import type { Shop, Category, Product } from '@/types/database'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validation'
import { FormField, Input, Textarea } from '@/components/ui/FormField'

function usePublicMenu(slug: string) {
  return useQuery({
    queryKey: ['publicMenu', slug],
    queryFn: async () => {
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single()
      if (shopErr || !shop) return null

      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('is_visible', true)
        .order('sort_order')

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('is_available', true)
        .order('sort_order')

      return {
        shop: shop as Shop,
        categories: (categories ?? []) as Category[],
        products: (products ?? []) as Product[],
      }
    },
    staleTime: 60_000,
  })
}

interface CartDrawerProps {
  shop: Shop
  onClose: () => void
}

function CartDrawer({ shop, onClose }: CartDrawerProps) {
  const { items, updateQty, removeItem, subtotal, clearCart } = useCartStore()
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  function onSubmit(data: CheckoutFormData) {
    if (!shop.whatsapp_number) {
      setError('This shop has not set up a WhatsApp number yet. Please contact them directly.')
      return
    }
    const message = buildOrderMessage({
      shopName: shop.name,
      items: items.map((i: CartItem) => ({ name: i.name, qty: i.qty, price: i.price, currency: shop.currency_code })),
      customerName: data.customer_name,
      note: data.order_note,
    })
    const link = buildWhatsAppLink(shop.whatsapp_number, message)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const total = subtotal()

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="ml-auto relative z-10 w-full max-w-sm bg-white flex flex-col h-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-navy-800">Your order</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-stone-400 text-sm mt-8">Your cart is empty.</p>
          ) : (
            items.map((item: CartItem) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.image_url ? (
                    <img src={getStorageUrl(item.image_url) ?? ''} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-300">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-800 truncate">{item.name}</p>
                  <p className="text-xs text-primary-600">{formatPrice(item.price, shop.currency_code)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-1 p-1 text-stone-300 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-navy-800">Subtotal</span>
              <span className="font-bold text-navy-800">{formatPrice(total, shop.currency_code)}</span>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {checkoutMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <FormField label="Your name" error={errors.customer_name?.message} required>
                  <Input {...register('customer_name')} placeholder="e.g. Ahmed" error={!!errors.customer_name} autoFocus />
                </FormField>
                <FormField label="Order note (optional)" error={errors.order_note?.message}>
                  <Textarea {...register('order_note')} placeholder="Any special requests?" rows={2} error={!!errors.order_note} />
                </FormField>
                <button type="submit" className="btn-whatsapp w-full">
                  <MessageCircle className="h-5 w-5" />
                  Order on WhatsApp
                </button>
                <p className="text-xs text-stone-400 text-center">
                  This will open WhatsApp with your order. The shop must confirm your order in the chat.
                </p>
              </form>
            ) : (
              <button onClick={() => setCheckoutMode(true)} className="btn-primary w-full">
                Proceed to checkout
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = usePublicMenu(slug ?? '')
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { items, addItem, setShop, totalItems } = useCartStore()
  const cartCount = totalItems()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-navy-800 mb-2">Menu not found</h1>
          <p className="text-stone-500 text-sm">
            This menu link may be invalid or the shop may not be active yet.
          </p>
        </div>
      </div>
    )
  }

  const { shop, categories, products } = data
  const logoUrl = getStorageUrl(shop.logo_url)

  // Initialize cart with shop info
  const handleAddItem = (product: Product) => {
    setShop(shop.slug, shop.currency_code)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
  }

  // Filter products by active category
  const visibleCategories = categories
  const uncategorizedProducts = products.filter((p: Product) => !p.category_id)

  const getProductsByCategory = (catId: string) =>
    products.filter((p: Product) => p.category_id === catId)

  const filteredCategories = activeCategory
    ? visibleCategories.filter((c: Category) => c.id === activeCategory)
    : visibleCategories

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Shop header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-30">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={shop.name} className="h-12 w-12 rounded-xl object-cover border border-stone-100" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <QrCode className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-navy-800 truncate">{shop.name}</h1>
              {shop.opening_hours && (
                <p className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {shop.opening_hours}
                </p>
              )}
            </div>
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 btn-primary btn-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-600 text-xs font-bold border border-primary-200">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {shop.address && (
            <p className="flex items-center gap-1 text-xs text-stone-400 mt-2">
              <MapPin className="h-3 w-3" />
              {shop.address}
            </p>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-stone-100 overflow-x-auto">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex gap-1 py-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-primary-500 text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                All
              </button>
              {categories.map((cat: Category) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-8 pb-24">
        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-400">No items available right now.</p>
          </div>
        )}

        {filteredCategories.map((cat: Category) => {
          const catProducts = getProductsByCategory(cat.id)
          if (catProducts.length === 0) return null
          return (
            <div key={cat.id}>
              <h2 className="text-lg font-bold text-navy-800 mb-4">{cat.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {catProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={shop.currency_code}
                    cartQty={items.find((i: CartItem) => i.id === product.id)?.qty ?? 0}
                    onAdd={() => handleAddItem(product)}
                    onUpdateQty={(qty: number) => useCartStore.getState().updateQty(product.id, qty)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Uncategorized */}
        {(!activeCategory || activeCategory === null) && uncategorizedProducts.length > 0 && (
          <div>
            {categories.length > 0 && <h2 className="text-lg font-bold text-navy-800 mb-4">Other</h2>}
            <div className="grid gap-4 sm:grid-cols-2">
              {uncategorizedProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={shop.currency_code}
                  cartQty={items.find((i: CartItem) => i.id === product.id)?.qty ?? 0}
                  onAdd={() => handleAddItem(product)}
                  onUpdateQty={(qty: number) => useCartStore.getState().updateQty(product.id, qty)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating cart button (mobile) */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center">
          <button
            onClick={() => setCartOpen(true)}
            className="btn-primary shadow-lg flex items-center gap-3 px-6 py-3 rounded-full"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>View order ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && <CartDrawer shop={shop} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  currency: string
  cartQty: number
  onAdd: () => void
  onUpdateQty: (qty: number) => void
}

function ProductCard({ product, currency, cartQty, onAdd, onUpdateQty }: ProductCardProps) {
  const imgUrl = getStorageUrl(product.image_url)

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {imgUrl && (
        <div className="aspect-video w-full overflow-hidden bg-stone-100">
          <img src={imgUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-navy-800">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-stone-400 mt-1 leading-relaxed line-clamp-2">{product.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-primary-600">{formatPrice(product.price, currency)}</span>
          {cartQty === 0 ? (
            <button onClick={onAdd} className="flex items-center gap-1 btn-primary btn-sm">
              <Plus className="h-4 w-4" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQty(cartQty - 1)}
                className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center font-semibold text-navy-800">{cartQty}</span>
              <button
                onClick={onAdd}
                className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
