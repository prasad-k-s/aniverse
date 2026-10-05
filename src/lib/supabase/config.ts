export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Anime browsing works without Supabase; sign-in, lists, reviews and comments
 * need the keys in .env.local (see README).
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Add your keys to .env.local (see README).')
    this.name = 'SupabaseNotConfiguredError'
  }
}
