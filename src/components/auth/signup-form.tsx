'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupValues } from '@/lib/validations'
import { FormField } from './form-field'

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ username, email, password }: SignupValues) => {
    setError(null)
    try {
      const supabase = createClient()

      // Friendly check before creating the account (the database also enforces uniqueness)
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()
      if (taken) {
        setFieldError('username', { message: 'That username is taken' })
        return
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: username },
          emailRedirectTo: `${siteUrl}/auth/callback?next=/watchlist`,
        },
      })
      if (authError) {
        setError(authError.message)
        return
      }

      // With email confirmation on, Supabase returns no session until the link is clicked
      if (!data.session) {
        setConfirmEmail(email)
        return
      }

      toast.success('Account created. Welcome to AniVerse!')
      router.replace('/watchlist')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  if (confirmEmail) {
    return (
      <div className="space-y-3 text-center" role="status">
        <MailCheckIcon className="text-primary mx-auto size-10" aria-hidden />
        <p className="font-semibold">Check your email</p>
        <p className="text-muted-foreground text-sm">
          We sent a confirmation link to <strong>{confirmEmail}</strong>. Click it to finish
          creating your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm" role="alert">
          {error}
        </p>
      )}
      <FormField
        id="username"
        label="Username"
        error={errors.username?.message}
        hint="Lowercase letters, numbers and underscores. Shown on your public profile."
      >
        <Input
          id="username"
          autoComplete="username"
          aria-invalid={Boolean(errors.username)}
          aria-describedby={errors.username ? 'username-error' : 'username-hint'}
          {...register('username')}
        />
      </FormField>
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
      </FormField>
      <FormField id="password" label="Password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
      </FormField>
      <FormField
        id="confirmPassword"
        label="Confirm password"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          {...register('confirmPassword')}
        />
      </FormField>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
