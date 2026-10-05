import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
  SupabaseNotConfiguredError,
} from './config'
import type { Database } from './database.types'

/** Supabase client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError()
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the middleware refreshes the session cookies.
        }
      },
    },
  })
}

/** The signed-in user, or null. getUser() verifies the session with Supabase. */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
