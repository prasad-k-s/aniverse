import { screen, waitFor } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import { frieren, makeEntry, testUser } from '@/test/fixtures'
import { jsonResponse, renderWithClient } from '@/test/render'
import { WatchlistButton } from './watchlist-button'

let mockAuth: { user: User | null; loading: boolean } = { user: null, loading: false }
jest.mock('@/components/providers/auth-provider', () => ({
  useUser: () => mockAuth,
}))

jest.mock('next/navigation', () => ({ usePathname: () => '/anime/154587' }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const fetchMock = jest.fn()

const props = {
  animeId: frieren.id,
  title: "Frieren: Beyond Journey's End",
  coverImage: frieren.coverImage.large,
  episodes: 28,
  format: 'TV' as const,
}

describe('WatchlistButton', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('asks signed-out users to log in and come back', () => {
    mockAuth = { user: null, loading: false }
    renderWithClient(<WatchlistButton {...props} />)

    expect(screen.getByRole('link', { name: /sign in to track/i })).toHaveAttribute(
      'href',
      '/login?next=%2Fanime%2F154587',
    )
  })

  it('adds the anime with the chosen status (optimistic update)', async () => {
    mockAuth = { user: testUser, loading: false }
    // Behaves like the real API: after a POST, GET returns the saved entry
    let saved: ReturnType<typeof makeEntry> | null = null
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        saved = makeEntry({ status: 'watching' })
        return Promise.resolve(jsonResponse({ entry: saved }, 201))
      }
      return Promise.resolve(jsonResponse({ entry: saved }))
    })
    const { user } = renderWithClient(<WatchlistButton {...props} />)

    await user.click(await screen.findByRole('button', { name: /add to list/i }))
    await user.click(await screen.findByRole('menuitem', { name: 'Watching' }))

    expect(await screen.findByRole('button', { name: /watching/i })).toBeInTheDocument()
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(postCall?.[1].body)).toEqual({
      animeId: frieren.id,
      status: 'watching',
      title: props.title,
      coverImage: props.coverImage,
      episodes: 28,
      format: 'TV',
    })
  })

  it('rolls back if the server rejects the change', async () => {
    mockAuth = { user: testUser, loading: false }
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === 'POST'
          ? jsonResponse({ error: 'Database is down' }, 500)
          : jsonResponse({ entry: null }),
      ),
    )
    const { user } = renderWithClient(<WatchlistButton {...props} />)

    await user.click(await screen.findByRole('button', { name: /add to list/i }))
    await user.click(await screen.findByRole('menuitem', { name: 'Completed' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /add to list/i })).toBeInTheDocument(),
    )
  })
})
