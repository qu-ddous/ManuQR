import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as currency */
export function formatPrice(amount: number, currency = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Generate a URL-encoded WhatsApp message link */
export function buildWhatsAppLink(phone: string, message: string): string {
  // Strip all non-digits except leading +
  const cleaned = phone.replace(/(?!^\+)\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

/** Build a WhatsApp order message */
export function buildOrderMessage(params: {
  shopName: string
  items: { name: string; qty: number; price: number; currency: string }[]
  customerName: string
  note?: string
}): string {
  const { shopName, items, customerName, note } = params
  const currency = items[0]?.currency || 'PKR'

  const lines = [
    `🛍️ *New Order – ${shopName}*`,
    '',
    '*Items:*',
    ...items.map(
      (i) => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty, currency)}`
    ),
    '',
    `*Subtotal:* ${formatPrice(
      items.reduce((s, i) => s + i.price * i.qty, 0),
      currency
    )}`,
    '',
    `*Customer name:* ${customerName}`,
  ]

  if (note) lines.push(`*Note:* ${note}`)
  lines.push('', '_(Sent via MenuQR)_')

  return lines.join('\n')
}

/** Validate an image File before upload */
export function validateImageFile(
  file: File,
  maxSizeMB = 5
): string | null {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, or GIF images are allowed.'
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image must be smaller than ${maxSizeMB} MB.`
  }
  return null
}

/** Sleep helper */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

