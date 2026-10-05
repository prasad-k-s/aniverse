'use client'

import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/components/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'

/** The signed-in user's profile row (username, avatar...). */
export function useProfile() {
  const { user } = useUser()

  return useQuery({
    queryKey: ['me', 'profile', user?.id],
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
  })
}
