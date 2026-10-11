import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QrCode, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { registerSchema, type RegisterFormData } from '@/lib/validation'
import { FormField, Input } from '@/components/ui/FormField'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterFormData) {
    setServerError('')
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    })

    if (signUpError) {
      setServerError(signUpError.message)
      return
    }

    if (authData.user) {
      // Profile is created by a DB trigger; navigate to dashboard
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-navy-800">MenuQR</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-800">Create your account</h1>
          <p className="text-stone-500 mt-1">Free to start. No credit card required.</p>
        </div>

        <div className="card p-6">
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full name" error={errors.full_name?.message} required>
              <Input
                {...register('full_name')}
                type="text"
                placeholder="Your name"
                autoComplete="name"
                error={!!errors.full_name}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message} required>
              <Input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={!!errors.email}
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password?.message}
              hint="At least 8 characters"
              required
            >
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
                  error={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {[
              'Set up your digital menu in minutes',
              'Share your QR code with customers',
              'Receive orders on WhatsApp instantly',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-xs text-stone-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
