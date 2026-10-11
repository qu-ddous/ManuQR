import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Upload, X, ExternalLink } from 'lucide-react'
import { supabase, STORAGE_BUCKET, getStorageUrl } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { shopSchema, type ShopFormData } from '@/lib/validation'
import { validateImageFile } from '@/lib/utils'
import { FormField, Input, Textarea, Select } from '@/components/ui/FormField'
import { StatusBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Shop } from '@/types/database'

const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'INR', 'BDT']

export default function ShopPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [uploadError, setUploadError] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [savedLogo, setSavedLogo] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const { data: shop, isLoading } = useQuery({
    queryKey: ['ownerShop', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user!.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data as Shop | null
    },
    enabled: !!user?.id,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ShopFormData>({ resolver: zodResolver(shopSchema) })

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        slug: shop.slug,
        description: shop.description ?? '',
        whatsapp_number: shop.whatsapp_number ?? '',
        address: shop.address ?? '',
        opening_hours: shop.opening_hours ?? '',
        currency_code: shop.currency_code,
      })
      setSavedLogo(shop.logo_url)
    }
  }, [shop, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      if (shop) {
        const { error } = await supabase
          .from('shops')
          .update({ ...data, logo_url: savedLogo, updated_at: new Date().toISOString() })
          .eq('id', shop.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('shops').insert({
          owner_id: user!.id,
          ...data,
          logo_url: savedLogo,
          status: 'pending',
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerShop', user?.id] })
      setSuccessMsg('Saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { setUploadError(err); return }
    setUploadError('')
    setUploading(true)

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to storage
    const path = `${user!.id}/logo-${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true })
    if (error) {
      setUploadError('Upload failed: ' + error.message)
    } else {
      setSavedLogo(path)
    }
    setUploading(false)
  }

  if (isLoading) return <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>

  const logoUrl = logoPreview || (savedLogo ? getStorageUrl(savedLogo) : null)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">{shop ? 'Shop Details' : 'Create Your Shop'}</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {shop ? 'Update your shop information.' : 'Fill in the details to create your shop.'}
          </p>
        </div>
        {shop && (
          <div className="flex items-center gap-3">
            <StatusBadge status={shop.status} />
            {shop.status === 'active' && (
              <a href={`/menu/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
                <ExternalLink className="h-4 w-4" />
                Preview
              </a>
            )}
          </div>
        )}
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {saveMutation.isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(saveMutation.error as Error).message}
        </div>
      )}

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="card p-6 space-y-5">
        {/* Logo */}
        <div>
          <label className="label">Logo (optional)</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden bg-stone-50">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-stone-300" />
              )}
            </div>
            <div>
              <label className="btn-secondary btn-sm cursor-pointer">
                {uploading ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  className="btn-ghost btn-sm ml-2"
                  onClick={() => { setSavedLogo(null); setLogoPreview(null) }}
                >
                  <X className="h-4 w-4" /> Remove
                </button>
              )}
              {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              <p className="text-xs text-stone-400 mt-1">Max 5 MB. JPEG, PNG, WebP, or GIF.</p>
            </div>
          </div>
        </div>

        <FormField label="Shop name" error={errors.name?.message} required>
          <Input {...register('name')} placeholder="e.g. Karachi Bites" error={!!errors.name} />
        </FormField>

        <FormField
          label="URL slug"
          error={errors.slug?.message}
          hint="Lowercase letters, numbers, and hyphens only. This becomes your menu URL."
          required
        >
          <div className="flex rounded-lg overflow-hidden border border-stone-300 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
            <span className="flex items-center px-3 bg-stone-50 text-stone-400 text-sm border-r border-stone-300 select-none">
              /menu/
            </span>
            <input
              {...register('slug')}
              className="flex-1 px-3 py-2.5 text-sm text-navy-800 focus:outline-none bg-white"
              placeholder="karachi-bites"
            />
          </div>
          {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Textarea {...register('description')} placeholder="Tell customers about your shop…" error={!!errors.description} />
        </FormField>

        <FormField
          label="WhatsApp number"
          error={errors.whatsapp_number?.message}
          hint="Include country code. e.g. +923001234567"
          required
        >
          <Input {...register('whatsapp_number')} type="tel" placeholder="+923001234567" error={!!errors.whatsapp_number} />
        </FormField>

        <FormField label="Address" error={errors.address?.message}>
          <Textarea {...register('address')} placeholder="Shop address or area" rows={2} error={!!errors.address} />
        </FormField>

        <FormField label="Opening hours" error={errors.opening_hours?.message} hint='e.g. "Mon–Sat 10am–10pm"'>
          <Input {...register('opening_hours')} placeholder="Mon–Sat 10am–10pm" error={!!errors.opening_hours} />
        </FormField>

        <FormField label="Currency" error={errors.currency_code?.message}>
          <Select {...register('currency_code')} error={!!errors.currency_code}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>

        <div className="pt-2 flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={isSubmitting || uploading}>
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : shop ? 'Save changes' : 'Create shop'}
          </button>
          {!isDirty && shop && <span className="text-sm text-stone-400">All changes saved</span>}
        </div>
      </form>
    </div>
  )
}
