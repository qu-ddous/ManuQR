import { z } from 'zod'

// Auth
export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type RegisterFormData = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginFormData = z.infer<typeof loginSchema>

// Shop
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const shopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters').max(80),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    .regex(slugRegex, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional().or(z.literal('')),
  whatsapp_number: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid WhatsApp number with country code, e.g. +92300XXXXXXX')
    .optional()
    .or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  opening_hours: z.string().max(200).optional().or(z.literal('')),
  currency_code: z.string().length(3).default('PKR'),
})
export type ShopFormData = z.infer<typeof shopSchema>

// Category
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(80),
  is_visible: z.boolean().default(true),
})
export type CategoryFormData = z.infer<typeof categorySchema>

// Product
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  price: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .multipleOf(0.01, 'Price can have at most 2 decimal places'),
  category_id: z.string().uuid().nullable().optional(),
  is_available: z.boolean().default(true),
})
export type ProductFormData = z.infer<typeof productSchema>

// Customer checkout
export const checkoutSchema = z.object({
  customer_name: z.string().min(1, 'Please enter your name'),
  order_note: z.string().max(300).optional().or(z.literal('')),
})
export type CheckoutFormData = z.infer<typeof checkoutSchema>

