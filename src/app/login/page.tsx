import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Log in' }

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to manage your list, write reviews and join the discussion."
      footer={
        <>
          New to AniVerse?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
