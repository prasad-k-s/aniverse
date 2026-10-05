import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = { title: 'Sign up' }

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Track what you watch, rate shows and meet other fans. It's free."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  )
}
