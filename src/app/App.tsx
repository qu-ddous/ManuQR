import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/app/ProtectedRoute'

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Public pages
import LandingPage from '@/pages/public/LandingPage'
import FeaturesPage from '@/pages/public/FeaturesPage'
import PricingPage from '@/pages/public/PricingPage'
import ContactPage from '@/pages/public/ContactPage'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Dashboard pages
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ShopPage from '@/pages/dashboard/ShopPage'
import MenuPage from '@/pages/dashboard/MenuPage'
import CategoriesPage from '@/pages/dashboard/CategoriesPage'
import QRCodePage from '@/pages/dashboard/QRCodePage'
import SettingsPage from '@/pages/dashboard/SettingsPage'

// Admin pages
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage'
import AdminShopsPage from '@/pages/admin/AdminShopsPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

// Public menu
import PublicMenuPage from '@/pages/menu/MenuPage'

// 404
import NotFoundPage from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public marketing pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth pages (no shared layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public menu page (no nav) */}
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
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

