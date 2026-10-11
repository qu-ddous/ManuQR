import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Upload, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase, STORAGE_BUCKET, getStorageUrl } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { productSchema, type ProductFormData } from '@/lib/validation'
import { validateImageFile, formatPrice } from '@/lib/utils'
import { FormField, Input, Textarea, Select } from '@/components/ui/FormField'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { Product, Category, Shop } from '@/types/database'

function useOwnerShop(userId: string) {
  return useQuery({
    queryKey: ['ownerShop', userId],
    queryFn: async () => {
      const { data } = await supabase.from('shops').select('*').eq('owner_id', userId).single()
      return data as Shop | null
    },
    enabled: !!userId,
  })
}

function useCategories(shopId: string) {
  return useQuery({
    queryKey: ['categories', shopId],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('shop_id', shopId).order('sort_order')
      return (data ?? []) as Category[]
    },
    enabled: !!shopId,
  })
}

function useProducts(shopId: string) {
  return useQuery({
    queryKey: ['products', shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('shop_id', shopId)
        .order('sort_order')
      if (error) throw error
      return data as (Product & { categories: { name: string } | null })[]
    },
    enabled: !!shopId,
  })
}

interface ProductFormModalProps {
  shopId: string
  shopCurrency: string
  categories: Category[]
  product?: Product
  open: boolean
  onClose: () => void
}

function ProductFormModal({ shopId, shopCurrency, categories, product, open, onClose }: ProductFormModalProps) {
  const queryClient = useQueryClient()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const { user } = useAuth()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? { name: product.name, description: product.description ?? '', price: product.price, category_id: product.category_id, is_available: product.is_available }
      : { is_available: true },
  })

  useEffect(() => {
    if (open) {
      reset(product
        ? { name: product.name, description: product.description ?? '', price: product.price, category_id: product.category_id ?? null, is_available: product.is_available }
        : { is_available: true, price: undefined as unknown as number }
      )
      setImagePreview(null)
      setImagePath(product?.image_url ?? null)
      setUploadError('')
    }
  }, [open, product, reset])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { setUploadError(err); return }
    setUploadError('')
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    const path = `${user!.id}/products/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true })
    if (error) setUploadError('Upload failed: ' + error.message)
    else setImagePath(path)
    setUploading(false)
  }

  async function onSubmit(data: ProductFormData) {
    const payload = { ...data, image_url: imagePath, shop_id: shopId }
    if (product) {
      await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', product.id)
    } else {
      const { data: last } = await supabase.from('products').select('sort_order').eq('shop_id', shopId).order('sort_order', { ascending: false }).limit(1).single()
      await supabase.from('products').insert({ ...payload, sort_order: ((last?.sort_order) ?? -1) + 1 })
    }
    queryClient.invalidateQueries({ queryKey: ['products', shopId] })
    onClose()
  }

  const imgUrl = imagePreview || (imagePath ? getStorageUrl(imagePath) : null)

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Edit product' : 'Add product'} className="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Image */}
        <div>
          <label className="label">Product image (optional)</label>
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden bg-stone-50 flex-shrink-0">
              {imgUrl ? <img src={imgUrl} alt="Preview" className="h-full w-full object-cover" /> : <Upload className="h-5 w-5 text-stone-300" />}
            </div>
            <div>
              <label className="btn-secondary btn-sm cursor-pointer">
                {uploading ? 'Uploading…' : 'Choose image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {imgUrl && (
                <button type="button" className="btn-ghost btn-sm ml-2" onClick={() => { setImagePath(null); setImagePreview(null) }}>
                  <X className="h-4 w-4" />
                </button>
              )}
              {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            </div>
          </div>
        </div>

        <FormField label="Product name" error={errors.name?.message} required>
          <Input {...register('name')} placeholder="e.g. Classic Burger" error={!!errors.name} autoFocus />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Textarea {...register('description')} placeholder="Optional description…" rows={2} error={!!errors.description} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={`Price (${shopCurrency})`} error={errors.price?.message} required>
            <Input {...register('price')} type="number" step="0.01" min="0" placeholder="0.00" error={!!errors.price} />
          </FormField>
          <FormField label="Category">
            <Select {...register('category_id')} error={!!errors.category_id}>
              <option value="">Uncategorized</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('is_available')} className="h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-400" />
          <span className="text-sm text-navy-700">Available (visible to customers)</span>
        </label>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || uploading}>
            {isSubmitting ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function MenuPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: shop } = useOwnerShop(user?.id ?? '')
  const { data: categories = [] } = useCategories(shop?.id ?? '')
  const { data: products = [], isLoading } = useProducts(shop?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Product | undefined>()

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('products').delete().eq('id', id) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', shop?.id] }),
  })

  async function toggleAvailability(p: Product) {
    await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    queryClient.invalidateQueries({ queryKey: ['products', shop?.id] })
  }

  async function moveProduct(p: Product, dir: 'up' | 'down') {
    const idx = products.findIndex((x) => x.id === p.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= products.length) return
    const swap = products[swapIdx]
    await Promise.all([
      supabase.from('products').update({ sort_order: swap.sort_order }).eq('id', p.id),
      supabase.from('products').update({ sort_order: p.sort_order }).eq('id', swap.id),
    ])
    queryClient.invalidateQueries({ queryKey: ['products', shop?.id] })
  }

  if (!shop) {
    return <div className="card p-8 text-center text-stone-500"><p>Please create your shop first.</p></div>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Menu Products</h1>
          <p className="text-stone-500 mt-1 text-sm">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditTarget(undefined); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : products.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-stone-500 text-sm">No products yet. Add your first menu item.</p>
        </div>
      ) : (
        <div className="card divide-y divide-stone-100">
          {products.map((product, idx) => {
            const imgUrl = getStorageUrl(product.image_url)
            return (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                {/* Image */}
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {imgUrl ? (
                    <img src={imgUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-300 text-lg">🍽️</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${product.is_available ? 'text-navy-800' : 'text-stone-400'}`}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-primary-600 font-semibold text-sm">
                      {formatPrice(product.price, shop.currency_code)}
                    </span>
                    {(product as any).categories?.name && (
                      <span className="text-xs text-stone-400">· {(product as any).categories.name}</span>
                    )}
                    {!product.is_available && <span className="text-xs text-stone-400">· Unavailable</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => moveProduct(product, 'up')} disabled={idx === 0} className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100 disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => moveProduct(product, 'down')} disabled={idx === products.length - 1} className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100 disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                  <button onClick={() => toggleAvailability(product)} className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100" aria-label={product.is_available ? 'Mark unavailable' : 'Mark available'}>
                    {product.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => { setEditTarget(product); setModalOpen(true) }} className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(product)} className="p-1.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ProductFormModal
        shopId={shop.id}
        shopCurrency={shop.currency_code}
        categories={categories}
        product={editTarget}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(undefined) } }}
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
