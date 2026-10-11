import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QrCode, ExternalLink, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { StatusBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Shop } from '@/types/database'

function useOwnerShop(userId: string) {
  return useQuery({
    queryKey: ['ownerShop', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data as Shop | null
    },
    enabled: !!userId,
  })
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { data: shop, isLoading } = useOwnerShop(user?.id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-800">
          Welcome, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-stone-500 mt-1">Manage your digital menu and QR code from here.</p>
      </div>

      {/* No shop yet */}
      {!shop && (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
            <QrCode className="h-7 w-7 text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-navy-800 mb-2">Create your shop</h2>
          <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
            Set up your shop details and we'll create a QR-linked digital menu for you.
          </p>
          <Link to="/dashboard/shop" className="btn-primary">
            Create my shop
          </Link>
        </div>
      )}

      {/* Shop exists */}
      {shop && (
        <>
          {/* Status banner */}
          {shop.status === 'pending' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Your shop is pending approval</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Our team will review your shop within 24 hours. You'll be able to share your public
                  menu once approved.
                </p>
              </div>
            </div>
          )}

          {shop.status === 'active' && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-emerald-800">Your shop is live!</p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Customers can view your menu at{' '}
                  <a
                    href={`/menu/${shop.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    /menu/{shop.slug}
                  </a>
                </p>
              </div>
              <a
                href={`/menu/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </a>
            </div>
          )}

          {shop.status === 'paused' && (
            <div className="rounded-xl bg-stone-100 border border-stone-200 p-4">
              <p className="font-medium text-stone-700">Your shop is paused</p>
              <p className="text-sm text-stone-500 mt-0.5">
                Contact support to restore your shop.
              </p>
            </div>
          )}

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/dashboard/shop', label: 'Edit Shop Details', desc: 'Name, description, hours' },
              { href: '/dashboard/menu', label: 'Manage Menu', desc: 'Add and edit products' },
              { href: '/dashboard/categories', label: 'Categories', desc: 'Organize your menu' },
              { href: '/dashboard/qr-code', label: 'QR Code', desc: 'Download and print' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="card p-5 hover:shadow-md transition-shadow group"
              >
                <p className="font-medium text-navy-800 group-hover:text-primary-600 transition-colors">
                  {item.label}
                </p>
                <p className="text-sm text-stone-400 mt-0.5">{item.desc}</p>
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-primary-500 mt-3 transition-colors" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
