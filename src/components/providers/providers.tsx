'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AniListError } from '@/lib/anilist/client'
import { useUiStore } from '@/store/ui-store'
import { AuthProvider } from './auth-provider'

function shouldRetry(failureCount: number, error: unknown) {
  // Don't retry "not found" or validation errors; retry network errors and rate limits
  if (
    error instanceof AniListError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
  ) {
    return false
  }
  return failureCount < 2
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      richColors
      position="bottom-center"
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
    />
  )
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: shouldRetry,
          },
        },
      }),
  )

  useEffect(() => {
    void useUiStore.persist.rehydrate()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <ThemedToaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
