import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [pending, active, paused] = await Promise.all([
        supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'paused'),
      ])
      return {
        pending: pending.count ?? 0,
        active: active.count ?? 0,
        paused: paused.count ?? 0,
      }
    },
  })

  if (isLoading) return <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>

  const cards = [
    { label: 'Pending shops', value: stats?.pending ?? 0, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active shops', value: stats?.active ?? 0, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Paused shops', value: stats?.paused ?? 0, color: 'text-stone-600 bg-stone-100' },
    { label: 'Total shops', value: (stats?.pending ?? 0) + (stats?.active ?? 0) + (stats?.paused ?? 0), color: 'text-navy-700 bg-navy-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Admin Overview</h1>
        <p className="text-stone-500 mt-1 text-sm">Platform statistics at a glance.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color} rounded-lg inline-flex items-center justify-center h-12 w-12`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
