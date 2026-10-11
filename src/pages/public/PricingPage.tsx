import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Try it out with no commitment.',
    features: ['1 shop', 'Up to 20 products', 'QR code download', 'WhatsApp ordering', 'Public menu link'],
    cta: 'Get started free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Professional',
    price: 'PKR 2,500',
    period: '/month',
    desc: 'For active food businesses.',
    features: ['1 shop', 'Unlimited products & categories', 'QR code download', 'WhatsApp ordering', 'Public menu link', 'Priority support', 'Custom currency'],
    cta: 'Contact us to subscribe',
    href: '/contact',
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-stone-100 to-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy-800 mb-4">Simple, honest pricing</h1>
          <p className="text-lg text-stone-500">Start free. No credit card. Upgrade when you need more.</p>
        </div>
      </section>

      <section className="py-12 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((p) => (
              <div key={p.name} className={`card p-8 flex flex-col ${p.highlight ? 'border-primary-300 ring-2 ring-primary-200' : ''}`}>
                {p.highlight && <span className="mb-4 self-start badge bg-primary-500 text-white">Popular choice</span>}
                <h2 className="text-xl font-bold text-navy-800">{p.name}</h2>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold text-navy-800">{p.price}</span>
                  <span className="text-stone-400 text-sm">{p.period}</span>
                </div>
                <p className="text-sm text-stone-500 mb-6">{p.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={p.href} className={`${p.highlight ? 'btn-primary' : 'btn-secondary'} text-center`}>
                  {p.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 card p-6 text-center">
            <p className="text-stone-500 text-sm">
              Need a custom plan for multiple locations?{' '}
              <Link to="/contact" className="text-primary-600 font-medium hover:underline">Contact us</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
