import { Link, NavLink, useNavigate } from 'react-router-dom'
import { QrCode, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export function PublicNav() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-navy-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-lg">MenuQR</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {publicLinks.map((l) => (
              <NavLink
                key={l.href}
                to={l.href}
                end
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-primary-600' : 'text-stone-600 hover:text-navy-800'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 pb-4">
          {publicLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="block py-2.5 text-sm font-medium text-stone-700 hover:text-primary-600"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-center" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-center" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-center" onClick={() => setOpen(false)}>
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

const dashboardLinks = [
  { href: '/dashboard', label: 'Overview', end: true },
  { href: '/dashboard/shop', label: 'Shop Details' },
  { href: '/dashboard/menu', label: 'Menu' },
  { href: '/dashboard/categories', label: 'Categories' },
  { href: '/dashboard/qr-code', label: 'QR Code' },
  { href: '/dashboard/settings', label: 'Settings' },
]

interface DashboardNavProps {
  onClose?: () => void
}

export function DashboardNav({ onClose }: DashboardNavProps) {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-stone-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
          <QrCode className="h-5 w-5" />
        </div>
        <span className="font-bold text-navy-800">MenuQR</span>
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {dashboardLinks.map((l) => (
          <NavLink
            key={l.href}
            to={l.href}
            end={l.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-navy-800'
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-stone-100 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-800">
              {profile?.full_name}
            </p>
            <p className="text-xs text-stone-400">Shop Owner</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-stone-400 hover:text-red-500 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const adminLinks = [
  { href: '/admin', label: 'Overview', end: true },
  { href: '/admin/shops', label: 'Shops' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminNav({ onClose }: DashboardNavProps) {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-stone-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-white">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-navy-800">MenuQR</span>
          <span className="ml-2 badge badge-danger bg-red-100 text-red-700">Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {adminLinks.map((l) => (
          <NavLink
            key={l.href}
            to={l.href}
            end={l.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-navy-100 text-navy-800'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-navy-800'
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-stone-100 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-700 text-sm font-semibold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-800">
              {profile?.full_name}
            </p>
            <p className="text-xs text-stone-400">Admin</p>
          </div>
          <button onClick={handleSignOut} className="text-stone-400 hover:text-red-500 transition-colors" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

