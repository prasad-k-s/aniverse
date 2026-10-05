import { createBrowserClient } from '@supabase/ssr'
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
  SupabaseNotConfiguredError,
} from './config'
import type { Database } from './database.types'

/** Supabase client for Client Components (stores the session in cookies). */
export function createClient() {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError()
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
