import { cn } from '@/lib/utils'
import type { ShopStatus } from '@/types/database'

const statusConfig: Record<ShopStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'badge-pending' },
  active: { label: 'Active', className: 'badge-active' },
  paused: { label: 'Paused', className: 'badge-paused' },
}

interface StatusBadgeProps {
  status: ShopStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: badgeClass } = statusConfig[status]
  return <span className={cn(badgeClass, className)}>{label}</span>
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const variantClasses = {
  default: 'bg-stone-100 text-stone-600',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  )
}
