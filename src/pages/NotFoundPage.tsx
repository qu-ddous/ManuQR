import { Link } from 'react-router-dom'
import { QrCode, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 text-primary-500">
          <QrCode className="h-10 w-10" />
        </div>
        <h1 className="text-6xl font-bold text-navy-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-navy-700 mb-3">Page not found</h2>
        <p className="text-stone-500 text-sm mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <Home className="h-4 w-4" />
          Go to homepage
        </Link>
      </div>
    </div>
  )
}

