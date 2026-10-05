import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { watchlistAddSchema, watchlistUpdateSchema } from '@/lib/validations'

/**
 * REST endpoint for the signed-in user's watchlist.
 *   GET    /api/watchlist              -> all entries
 *   GET    /api/watchlist?animeId=123  -> one entry (or null)
 *   POST   /api/watchlist              -> add / replace an entry
 *   PATCH  /api/watchlist              -> update status or score
 *   DELETE /api/watchlist?animeId=123  -> remove an entry
 * Row Level Security in Postgres also guarantees users can only touch their own rows.
 */

type WatchlistUpdate = Database['public']['Tables']['watchlist']['Update']

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function parseAnimeId(value: string | null): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return error('Supabase is not configured', 503)
  const { supabase, user } = await getSession()
  if (!user) return error('You need to be signed in.', 401)

  const animeIdParam = request.nextUrl.searchParams.get('animeId')
  if (animeIdParam !== null) {
    const animeId = parseAnimeId(animeIdParam)
    if (!animeId) return error('Invalid animeId', 400)
    const { data, error: dbError } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
      .maybeSingle()
    if (dbError) return error(dbError.message, 500)
    return NextResponse.json({ entry: data })
  }

  const { data, error: dbError } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  if (dbError) return error(dbError.message, 500)
  return NextResponse.json({ entries: data })
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return error('Supabase is not configured', 503)
  const parsed = watchlistAddSchema.safeParse(await readJson(request))
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid request', 400)

  const { supabase, user } = await getSession()
  if (!user) return error('You need to be signed in.', 401)

  const { animeId, status, title, coverImage, episodes, format } = parsed.data
  const { data, error: dbError } = await supabase
    .from('watchlist')
    .upsert(
      {
        user_id: user.id,
        anime_id: animeId,
        status,
        title,
        cover_image: coverImage,
        episodes,
        format,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,anime_id' },
    )
    .select()
    .single()

  if (dbError) return error(dbError.message, 500)
  return NextResponse.json({ entry: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured) return error('Supabase is not configured', 503)
  const parsed = watchlistUpdateSchema.safeParse(await readJson(request))
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid request', 400)

  const { supabase, user } = await getSession()
  if (!user) return error('You need to be signed in.', 401)

  const { animeId, status, score } = parsed.data
  const changes: WatchlistUpdate = { updated_at: new Date().toISOString() }
  if (status !== undefined) changes.status = status
  if (score !== undefined) changes.score = score

  const { data, error: dbError } = await supabase
    .from('watchlist')
    .update(changes)
    .eq('user_id', user.id)
    .eq('anime_id', animeId)
    .select()
    .maybeSingle()

  if (dbError) return error(dbError.message, 500)
  if (!data) return error('This anime is not in your list.', 404)
  return NextResponse.json({ entry: data })
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured) return error('Supabase is not configured', 503)
  const animeId = parseAnimeId(request.nextUrl.searchParams.get('animeId'))
  if (!animeId) return error('Invalid animeId', 400)

  const { supabase, user } = await getSession()
  if (!user) return error('You need to be signed in.', 401)

  const { error: dbError } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('anime_id', animeId)

  if (dbError) return error(dbError.message, 500)
  return NextResponse.json({ ok: true })
}
