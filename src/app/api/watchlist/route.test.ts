/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { DELETE, PATCH, POST } from './route'

type Result = { data?: unknown; error?: { message: string } | null }

/** A fake Supabase query builder: every method chains, and awaiting it returns `result`. */
function queryBuilder(result: Result) {
  const builder: Record<string, unknown> = {}
  for (const method of [
    'select',
    'upsert',
    'update',
    'delete',
    'eq',
    'order',
    'single',
    'maybeSingle',
  ]) {
    builder[method] = jest.fn(() => builder)
  }
  builder.then = (resolve: (value: Result) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve({ error: null, ...result }).then(resolve, reject)
  return builder
}

let currentUser: { id: string } | null = { id: 'user-1' }
let builder = queryBuilder({ data: null })

jest.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured: true }))
jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: currentUser } }) },
    from: () => builder,
  }),
}))

function jsonRequest(method: string, body: unknown, query = '') {
  return new NextRequest(`http://localhost/api/watchlist${query}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const newEntry = {
  animeId: 154587,
  status: 'completed',
  title: 'Frieren',
  coverImage: 'https://s4.anilist.co/frieren.jpg',
  episodes: 28,
  format: 'TV',
}

describe('/api/watchlist', () => {
  beforeEach(() => {
    currentUser = { id: 'user-1' }
    builder = queryBuilder({ data: { anime_id: 154587 } })
  })

  it('returns 401 when the user is not signed in', async () => {
    currentUser = null
    const response = await POST(jsonRequest('POST', newEntry))
    expect(response.status).toBe(401)
  })

  it('returns 400 for an invalid body', async () => {
    const response = await POST(jsonRequest('POST', { ...newEntry, status: 'binged' }))
    expect(response.status).toBe(400)
  })

  it('saves an entry for the signed-in user', async () => {
    const response = await POST(jsonRequest('POST', newEntry))

    expect(response.status).toBe(201)
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        anime_id: 154587,
        status: 'completed',
      }),
      { onConflict: 'user_id,anime_id' },
    )
  })

  it("updates only the user's own row", async () => {
    const response = await PATCH(jsonRequest('PATCH', { animeId: 154587, score: 9 }))

    expect(response.status).toBe(200)
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ score: 9 }))
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(builder.eq).toHaveBeenCalledWith('anime_id', 154587)
  })

  it('returns 404 when updating an anime that is not in the list', async () => {
    builder = queryBuilder({ data: null })
    const response = await PATCH(jsonRequest('PATCH', { animeId: 1, status: 'paused' }))
    expect(response.status).toBe(404)
  })

  it('deletes by animeId and validates it', async () => {
    expect((await DELETE(jsonRequest('DELETE', undefined, '?animeId=abc'))).status).toBe(400)

    const response = await DELETE(jsonRequest('DELETE', undefined, '?animeId=154587'))
    expect(response.status).toBe(200)
    expect(builder.delete).toHaveBeenCalled()
  })
})
