import { Link } from 'react-router-dom'
import {
  QrCode,
  MessageCircle,
  Utensils,
  ChevronRight,
  Star,
  Smartphone,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: QrCode,
    title: 'QR Code Generator',
    desc: 'Generate a scannable QR code that links directly to your digital menu. Print it, display it, share it anywhere.',
  },
  {
    icon: Utensils,
    title: 'Beautiful Digital Menu',
    desc: 'Showcase your items with photos, descriptions, and prices. Organize by category. Update instantly, any time.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Ordering',
    desc: 'Customers tap "Order on WhatsApp" and a fully formatted order arrives in your chat. No app required.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    desc: 'Your menu looks great on any screen — phones, tablets, or desktops. Customers never need to pinch or zoom.',
  },
  {
    icon: BarChart2,
    title: 'Easy Management',
    desc: "Add, edit, hide, or reorder items in seconds. Even if you've never built a website, you'll figure it out in minutes.",
  },
  {
    icon: ShieldCheck,
    title: 'Always Up to Date',
    desc: 'Change prices, add specials, or mark items sold out — it reflects immediately on your menu. No reprinting needed.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for trying it out.',
    features: ['1 shop', 'Up to 20 products', 'QR code download', 'WhatsApp ordering'],
    cta: 'Get started free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Professional',
    price: 'PKR 2,500',
    period: '/month',
    desc: 'Everything you need to grow.',
    features: ['1 shop', 'Unlimited products', 'QR code download', 'WhatsApp ordering', 'Priority support'],
    cta: 'Contact to subscribe',
    href: '/contact',
    highlight: true,
  },
]

const faqs = [
  {
    q: 'Do customers need to create an account?',
    a: 'No. Customers simply scan your QR code, browse your menu, and send you their order on WhatsApp. No sign-up required.',
  },
  {
    q: 'Do I need WhatsApp Business?',
    a: 'No. Regular WhatsApp works. Customers just open a chat with your number pre-filled with their order.',
  },
  {
    q: 'Can I update my menu myself?',
    a: 'Yes. Log in to your dashboard any time, add or edit items, and changes appear instantly on your live menu.',
  },
  {
    q: 'What happens after I register?',
    a: "After registering and creating your shop, it will be reviewed by our team. You'll be approved quickly and your QR-linked menu will go live.",
  },
  {
    q: 'Is MenuQR available in Pakistan?',
    a: 'Yes. We support PKR as the default currency and WhatsApp is the primary ordering channel — perfect for the Pakistani market.',
  },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-stone-50 py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 mb-6">
              <Star className="h-4 w-4" />
              <span>Digital menus for every food business</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy-800 leading-tight mb-6">
              Your menu,{' '}
              <span className="text-primary-500">digitized</span>
              {' '}in minutes
            </h1>
            <p className="text-lg sm:text-xl text-stone-500 mb-10 max-w-2xl mx-auto">
              MenuQR lets restaurants, cafes, bakeries, and home chefs publish a beautiful digital menu,
              generate a QR code, and receive customer orders straight to WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary btn-lg">
                Create your menu free
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/features" className="btn-secondary btn-lg">
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-8 text-center">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">DEMO PREVIEW</p>
            <div className="inline-flex gap-4 flex-wrap justify-center">
              {['Burger', 'Pizza', 'Zinger', 'Fries', 'Shake'].map((item, i) => (
                <div key={item} className="card px-5 py-4 text-center min-w-[120px]">
                  <div className="h-16 w-16 rounded-xl bg-primary-100 mx-auto mb-3 flex items-center justify-center text-2xl">
                    {['🍔','🍕','🍗','🍟','🥤'][i]}
                  </div>
                  <p className="font-medium text-navy-800 text-sm">{item}</p>
                  <p className="text-primary-600 font-semibold text-sm mt-0.5">PKR {[350,450,320,180,250][i]}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-stone-400">
              Register to create your real menu →{' '}
              <Link to="/register" className="text-primary-600 hover:underline">Get started</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800">Everything you need</h2>
            <p className="mt-3 text-stone-500 max-w-xl mx-auto">
              From menu setup to customer ordering — all in one place.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-navy-800 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800">Simple pricing</h2>
            <p className="mt-3 text-stone-500">Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`card p-8 flex flex-col ${
                  p.highlight ? 'border-primary-300 ring-2 ring-primary-200' : ''
                }`}
              >
                {p.highlight && (
                  <span className="mb-4 self-start badge bg-primary-500 text-white">Most popular</span>
                )}
                <h3 className="text-xl font-bold text-navy-800">{p.name}</h3>
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
                <Link
                  to={p.href}
                  className={p.highlight ? 'btn-primary text-center' : 'btn-secondary text-center'}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-800">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="card p-6">
                <h3 className="font-semibold text-navy-800 mb-2">{faq.q}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-500">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to go digital?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join hundreds of food businesses already using MenuQR.
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg">
            Create your free menu
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
