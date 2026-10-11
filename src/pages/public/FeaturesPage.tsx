import { Link } from 'react-router-dom'
import { QrCode, MessageCircle, Utensils, Smartphone, RefreshCw, Globe, ChevronRight } from 'lucide-react'

const steps = [
  { step: '1', title: 'Register and create your shop', desc: 'Sign up, fill in your shop details, add your WhatsApp number. Takes under 5 minutes.' },
  { step: '2', title: 'Build your menu', desc: 'Add categories and products with names, descriptions, prices, and photos. Reorder items with a click.' },
  { step: '3', title: 'Get approved and share your QR', desc: 'Once approved, download your QR code and display it at your counter, on tables, or share the link online.' },
  { step: '4', title: 'Receive WhatsApp orders', desc: 'Customers scan, browse, and tap "Order on WhatsApp". A formatted order message arrives in your WhatsApp chat.' },
]

const capabilities = [
  { icon: QrCode, title: 'Instant QR Codes', desc: 'Generate and download a high-quality QR code that always links to your latest menu.' },
  { icon: Utensils, title: 'Category & Product Management', desc: 'Organize items into categories. Add photos, set prices, mark availability. Reorder with drag or arrows.' },
  { icon: MessageCircle, title: 'WhatsApp-Native Ordering', desc: 'No new app for customers. The order message includes all items, quantities, prices, and a subtotal.' },
  { icon: Smartphone, title: 'Mobile-Optimized Menu', desc: 'Your public menu renders perfectly on any device. Sticky cart, smooth scrolling, easy browsing.' },
  { icon: RefreshCw, title: 'Real-Time Updates', desc: 'Mark an item as sold out and it disappears from the customer view instantly. Update prices any time.' },
  { icon: Globe, title: 'Shareable Link', desc: 'Every shop gets a unique URL at menuqr.com/menu/your-shop. Share it on Instagram, WhatsApp, anywhere.' },
]

export default function FeaturesPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy-800 mb-4">How MenuQR works</h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            A simple, powerful system designed for food businesses of every size.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-800 mb-10 text-center">Get started in 4 steps</h2>
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-navy-800 mb-1">{s.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-10 text-center">What you can do</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c) => (
              <div key={c.title} className="card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-navy-800 mb-2">{c.title}</h3>
                <p className="text-sm text-stone-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-500">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to try it?</h2>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg">
            Create your free menu <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
