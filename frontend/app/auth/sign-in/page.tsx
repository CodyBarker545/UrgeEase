'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { signIn as apiSignIn } from '@/frontend/lib/api'
import { useAuthStore } from '@/frontend/lib/store'
import { AuthCard, AuthHeader, AuthFooterLinks } from '@/frontend/components/auth/AuthCard'
import { Input } from '@/frontend/components/ui/input'
import { PasswordInput } from '@/frontend/components/ui/password-input'
import { Label } from '@/frontend/components/ui/label'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const token = useAuthStore((state) => state.token)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    const msg = searchParams.get('message')
    const emailFromQuery = searchParams.get('email')
    if (emailFromQuery) {
      setValue('email', emailFromQuery)
    }
    if (msg) {
      setError('root', { message: msg })
    }

    if (token) {
      router.push('/app/home')
    }
  }, [token, router, searchParams, setError, setValue])

  const onSubmit = async (values: SignInValues) => {
    const result = await apiSignIn({ email: values.email, password: values.password })
    if (!result.ok || !result.token || !result.user) {
      setError('root', {
        message: result.error || 'Unable to sign in. Please try again.',
      })
      return
    }
    login(result.token, result.user)
    router.push('/app/home')
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Sign in to continue"
        subtitle="Pick up where you left off with chat or voice."
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs" role="alert" style={{ color: '#dc2626' }}>
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs" role="alert" style={{ color: '#dc2626' }}>
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.root && (
          <div
            className="rounded-md px-3 py-2 text-xs"
            role="alert"
            style={{
              border: '1px solid rgba(220, 38, 38, 0.4)',
              backgroundColor: 'rgba(220, 38, 38, 0.05)',
              color: '#dc2626',
            }}
          >
            {errors.root.message}
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded-full px-6 py-3 text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text-light)',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)'
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--color-accent)'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <AuthFooterLinks mode="sign-in" />
    </AuthCard>
  )
}

