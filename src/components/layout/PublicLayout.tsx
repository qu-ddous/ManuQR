import { Outlet } from 'react-router-dom'
import { PublicNav } from '@/components/layout/Nav'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone-100 bg-white py-8 mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-500">
              © {new Date().getFullYear()} MenuQR. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-stone-400">
              <span>Digital menus made simple.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

