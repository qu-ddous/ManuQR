import { MessageCircle, Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
  const waLink = `https://wa.me/923001234567?text=${encodeURIComponent('Hi! I have a question about MenuQR.')}`

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-stone-100 to-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy-800 mb-4">Get in touch</h1>
          <p className="text-lg text-stone-500">Questions about MenuQR? We're happy to help.</p>
        </div>
      </section>

      <section className="py-12 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-navy-800 mb-1">WhatsApp</h3>
              <p className="text-sm text-stone-500 mb-4">Message us directly on WhatsApp for the fastest response.</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-sm">
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-navy-800 mb-1">Email</h3>
              <p className="text-sm text-stone-500 mb-4">Prefer email? We'll reply within one business day.</p>
              <a href="mailto:hello@menuqr.app" className="btn-secondary btn-sm">
                <Mail className="h-4 w-4" />
                hello@menuqr.app
              </a>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-navy-800 mb-4">Frequently asked</h3>
            <div className="space-y-4">
              {[
                { q: 'How long does approval take?', a: 'We review and approve new shops within 24 hours on business days.' },
                { q: 'Can I upgrade my plan?', a: 'Yes. Contact us on WhatsApp or by email and we will activate your plan immediately.' },
                { q: 'Is there a setup fee?', a: 'No setup fee. The Starter plan is completely free to use.' },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="font-medium text-navy-800 text-sm">{q}</p>
                  <p className="text-stone-500 text-sm mt-0.5">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
