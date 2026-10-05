import type { WatchlistEntry } from '@/lib/supabase/database.types'
import type { WatchlistAddInput, WatchlistUpdateInput } from '@/lib/validations'

/** Typed client for our own /api/watchlist route handler. */
async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
  return body
}

export const watchlistApi = {
  getAll: () => request<{ entries: WatchlistEntry[] }>('/api/watchlist').then((r) => r.entries),

  getOne: (animeId: number) =>
    request<{ entry: WatchlistEntry | null }>(`/api/watchlist?animeId=${animeId}`).then(
      (r) => r.entry,
    ),

  add: (input: WatchlistAddInput) =>
    request<{ entry: WatchlistEntry }>('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify(input),
    }).then((r) => r.entry),

  update: (input: WatchlistUpdateInput) =>
    request<{ entry: WatchlistEntry }>('/api/watchlist', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }).then((r) => r.entry),

  remove: (animeId: number) =>
    request<{ ok: true }>(`/api/watchlist?animeId=${animeId}`, { method: 'DELETE' }),
}
