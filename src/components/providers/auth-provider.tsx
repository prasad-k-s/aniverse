'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

interface AuthState {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthState>({ user: null, loading: false })

/**
 * Keeps the signed-in user available to Client Components. Pages stay static
 * (cacheable), and user-specific parts load on the client.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ user: null, loading: isSupabaseConfigured })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => setState({ user: data.user, loading: false }))

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ user: session?.user ?? null, loading: false })
      // Don't show the previous user's private data after a sign-out or account switch
      if (event === 'SIGNED_OUT') queryClient.removeQueries({ queryKey: ['me'] })
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useUser() {
  return useContext(AuthContext)
}
