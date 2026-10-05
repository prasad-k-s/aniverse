import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { WatchlistBoard } from '@/components/watchlist/watchlist-board'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'My list' }

export default async function WatchlistPage() {
  if (!isSupabaseConfigured) redirect('/login')

  // Rendered on the server with the user's data, so the list shows instantly (no loading spinner)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/watchlist')

  const { data: entries, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw new Error('Could not load your list. Please try again.')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">My list</h1>
      <WatchlistBoard initialEntries={entries} />
    </div>
  )
}
