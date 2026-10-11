import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { categorySchema, type CategoryFormData } from '@/lib/validation'
import { FormField, Input } from '@/components/ui/FormField'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { Category, Shop } from '@/types/database'

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
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order')
      if (error) throw error
      return data as Category[]
    },
    enabled: !!shopId,
  })
}

interface CategoryFormModalProps {
  shopId: string
  category?: Category
  open: boolean
  onClose: () => void
}

function CategoryFormModal({ shopId, category, open, onClose }: CategoryFormModalProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '', is_visible: category?.is_visible ?? true },
  })

  async function onSubmit(data: CategoryFormData) {
    if (category) {
      await supabase.from('categories').update(data).eq('id', category.id)
    } else {
      const { data: existing } = await supabase
        .from('categories')
        .select('sort_order')
        .eq('shop_id', shopId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      const nextOrder = ((existing?.sort_order) ?? -1) + 1
      await supabase.from('categories').insert({ ...data, shop_id: shopId, sort_order: nextOrder })
    }
    queryClient.invalidateQueries({ queryKey: ['categories', shopId] })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Edit category' : 'Add category'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Category name" error={errors.name?.message} required>
          <Input {...register('name')} placeholder="e.g. Burgers, Drinks" error={!!errors.name} autoFocus />
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('is_visible')} className="h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-400" />
          <span className="text-sm text-navy-700">Visible on public menu</span>
        </label>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : category ? 'Save changes' : 'Add category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function CategoriesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: shop } = useOwnerShop(user?.id ?? '')
  const { data: categories = [], isLoading } = useCategories(shop?.id ?? '')

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Category | undefined>()

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', shop?.id] }),
  })

  async function toggleVisibility(cat: Category) {
    await supabase.from('categories').update({ is_visible: !cat.is_visible }).eq('id', cat.id)
    queryClient.invalidateQueries({ queryKey: ['categories', shop?.id] })
  }

  async function moveCategory(cat: Category, dir: 'up' | 'down') {
    const idx = categories.findIndex((c) => c.id === cat.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return
    const swap = categories[swapIdx]
    await Promise.all([
      supabase.from('categories').update({ sort_order: swap.sort_order }).eq('id', cat.id),
      supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', swap.id),
    ])
    queryClient.invalidateQueries({ queryKey: ['categories', shop?.id] })
  }

  if (!shop) {
    return (
      <div className="card p-8 text-center text-stone-500">
        <p>Please create your shop first.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Categories</h1>
          <p className="text-stone-500 mt-1 text-sm">Organize your menu into sections.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setEditTarget(undefined); setModalOpen(true) }}
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : categories.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-stone-500 text-sm">No categories yet. Add your first one.</p>
        </div>
      ) : (
        <div className="card divide-y divide-stone-100">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="h-4 w-4 text-stone-300 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${cat.is_visible ? 'text-navy-800' : 'text-stone-400 line-through'}`}>
                  {cat.name}
                </p>
                {!cat.is_visible && <p className="text-xs text-stone-400">Hidden</p>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveCategory(cat, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveCategory(cat, 'down')}
                  disabled={idx === categories.length - 1}
                  className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleVisibility(cat)}
                  className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100"
                  aria-label={cat.is_visible ? 'Hide' : 'Show'}
                >
                  {cat.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setEditTarget(cat); setModalOpen(true) }}
                  className="p-1.5 rounded text-stone-400 hover:text-navy-700 hover:bg-stone-100"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-1.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        shopId={shop.id}
        category={editTarget}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
            setDeleteTarget(undefined)
          }
        }}
        title="Delete category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category won't be deleted but will become uncategorized.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
