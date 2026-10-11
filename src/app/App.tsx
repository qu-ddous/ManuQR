import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { Spinner } from '@/components/ui/Spinner'

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Public pages
import LandingPage from '@/pages/public/LandingPage'
import FeaturesPage from '@/pages/public/FeaturesPage'
import PricingPage from '@/pages/public/PricingPage'
import ContactPage from '@/pages/public/ContactPage'
import PublicMenuPage from '@/pages/menu/MenuPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Dashboard pages (lazy loaded)
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ShopPage = lazy(() => import('@/pages/dashboard/ShopPage'))
const MenuPage = lazy(() => import('@/pages/dashboard/MenuPage'))
const CategoriesPage = lazy(() => import('@/pages/dashboard/CategoriesPage'))
const QRCodePage = lazy(() => import('@/pages/dashboard/QRCodePage'))
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'))

// Admin pages (lazy loaded)
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const AdminShopsPage = lazy(() => import('@/pages/admin/AdminShopsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function LoadingFallback() {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-8">
      <Spinner size="lg" />
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public marketing pages */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* Auth pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public customer menu */}
              <Route path="/menu/:slug" element={<PublicMenuPage />} />

              {/* Owner dashboard (protected) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dashboard/shop" element={<ShopPage />} />
                  <Route path="/dashboard/menu" element={<MenuPage />} />
                  <Route path="/dashboard/categories" element={<CategoriesPage />} />
                  <Route path="/dashboard/qr-code" element={<QRCodePage />} />
                  <Route path="/dashboard/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Admin panel (protected, admin role required) */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminOverviewPage />} />
                  <Route path="/admin/shops" element={<AdminShopsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
