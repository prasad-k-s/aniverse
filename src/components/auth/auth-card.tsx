import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex justify-center px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSupabaseConfigured && (
            <p
              className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
              role="alert"
            >
              Supabase isn&apos;t configured yet, so accounts won&apos;t work. Add your keys to{' '}
              <code>.env.local</code> (see README).
            </p>
          )}
          {children}
          <div className="text-muted-foreground text-center text-sm">{footer}</div>
        </CardContent>
      </Card>
    </div>
  )
}
