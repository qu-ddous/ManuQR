import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { supabase, getMenuUrl } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { Spinner } from '@/components/ui/Spinner'
import type { Shop } from '@/types/database'

export default function QRCodePage() {
  const { user } = useAuth()
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  const { data: shop, isLoading } = useQuery({
    queryKey: ['ownerShop', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('shops').select('*').eq('owner_id', user!.id).single()
      return data as Shop | null
    },
    enabled: !!user?.id,
  })

  if (isLoading) return <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>

  if (!shop) {
    return (
      <div className="card p-8 text-center text-stone-500">
        <p>Please create your shop first to generate a QR code.</p>
      </div>
    )
  }

  if (shop.status !== 'active') {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-navy-800">QR Code</h1>
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="font-semibold text-navy-800 mb-2">Waiting for approval</h2>
          <p className="text-sm text-stone-500">
            Your QR code will be available once your shop is approved by our team.
          </p>
        </div>
      </div>
    )
  }

  const menuUrl = getMenuUrl(shop.slug)

  function downloadQR() {
    const canvas = qrRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${shop!.slug}-qr-code.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">QR Code</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Display this QR code so customers can scan and view your menu.
        </p>
      </div>

      {/* QR Card */}
      <div className="card p-8 flex flex-col items-center gap-6">
        {/* Print-friendly QR card */}
        <div
          id="qr-print-card"
          className="flex flex-col items-center gap-4 p-6 border-2 border-stone-100 rounded-2xl bg-white"
        >
          <p className="text-sm font-medium text-stone-400 uppercase tracking-wider">Scan to view menu</p>
          <QRCodeCanvas
            ref={qrRef}
            value={menuUrl}
            size={200}
            level="H"
            includeMargin
            imageSettings={{
              src: '/favicon.svg',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
          <div className="text-center">
            <p className="font-bold text-navy-800 text-lg">{shop.name}</p>
            <p className="text-xs text-stone-400 mt-0.5">{menuUrl}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center w-full">
          <button onClick={downloadQR} className="btn-primary">
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <ExternalLink className="h-4 w-4" />
            Open menu
          </a>
          <button onClick={copyLink} className="btn-ghost">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-navy-800">How to use your QR code</h3>
        <ul className="space-y-2 text-sm text-stone-500">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary-500 mt-0.5">1.</span>
            Download and print the QR code.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary-500 mt-0.5">2.</span>
            Display it on your counter, tables, packaging, or storefront.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary-500 mt-0.5">3.</span>
            Customers scan it with their phone camera and see your live menu.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary-500 mt-0.5">4.</span>
            They tap <strong>Order on WhatsApp</strong> and the order goes straight to your chat.
          </li>
        </ul>
      </div>
    </div>
  )
}

