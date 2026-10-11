import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle, PauseCircle, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import type { ShopWithOwner, ShopStatus } from '@/types/database'

type FilterStatus = ShopStatus | 'all'

export default function AdminShopsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [actionTarget, setActionTarget] = useState<{ shop: ShopWithOwner; action: 'approve' | 'pause' } | null>(null)

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['adminShops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ShopWithOwner[]
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ShopStatus }) => {
      const { error } = await supabase
        .from('shops')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminShops'] }),
  })

  const filtered = shops.filter((s: ShopWithOwner) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Shops</h1>
        <p className="text-stone-500 mt-1 text-sm">Review and manage all registered shops.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'active', 'paused'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn-sm rounded-full capitalize ${
                filter === s ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-stone-500 text-sm">No shops found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Shop</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((shop: ShopWithOwner) => (
                  <tr key={shop.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-800">{shop.name}</p>
                      <p className="text-stone-400 text-xs">/menu/{shop.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {shop.profiles?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={shop.status} />
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs">
                      {new Date(shop.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {shop.status === 'active' && (
                          <a
                            href={`/menu/${shop.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost btn-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {shop.status === 'pending' && (
                          <button
                            onClick={() => setActionTarget({ shop, action: 'approve' })}
                            className="btn-sm bg-emerald-500 text-white hover:bg-emerald-600 inline-flex items-center gap-1 rounded-lg px-3 py-1.5"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                        )}
                        {shop.status === 'active' && (
                          <button
                            onClick={() => setActionTarget({ shop, action: 'pause' })}
                            className="btn-sm btn-secondary inline-flex items-center gap-1"
                          >
                            <PauseCircle className="h-4 w-4" />
                            Pause
                          </button>
                        )}
                        {shop.status === 'paused' && (
                          <button
                            onClick={() => setActionTarget({ shop, action: 'approve' })}
                            className="btn-sm bg-emerald-500 text-white hover:bg-emerald-600 inline-flex items-center gap-1 rounded-lg px-3 py-1.5"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={() => {
          if (!actionTarget) return
          updateStatus.mutate({
            id: actionTarget.shop.id,
            status: actionTarget.action === 'approve' ? 'active' : 'paused',
          })
          setActionTarget(null)
        }}
        title={actionTarget?.action === 'approve' ? 'Approve shop' : 'Pause shop'}
        message={
          actionTarget?.action === 'approve'
            ? `Approve "${actionTarget.shop.name}"? Their menu will go live immediately.`
            : `Pause "${actionTarget?.shop.name}"? Their public menu will be hidden.`
        }
        confirmLabel={actionTarget?.action === 'approve' ? 'Approve' : 'Pause'}
        danger={actionTarget?.action === 'pause'}
        loading={updateStatus.isPending}
      />
    </div>
  )
}
