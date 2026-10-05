import { screen, waitFor } from '@testing-library/react'
import { makeEntry, testUser } from '@/test/fixtures'
import { jsonResponse, renderWithClient } from '@/test/render'
import { WatchlistRow } from './watchlist-board'

jest.mock('@/components/providers/auth-provider', () => ({
  useUser: () => ({ user: testUser, loading: false }),
}))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const fetchMock = jest.fn()

function callsWith(method: string) {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === method)
}

describe('WatchlistRow', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(jsonResponse({ entry: makeEntry() }))
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('shows the title, status and score', () => {
    renderWithClient(<WatchlistRow entry={makeEntry({ status: 'watching', score: 8 })} />)

    expect(screen.getByRole('link', { name: "Frieren: Beyond Journey's End" })).toHaveAttribute(
      'href',
      '/anime/154587',
    )
    expect(screen.getByRole('combobox', { name: /status for/i })).toHaveValue('watching')
    expect(screen.getByRole('combobox', { name: /your score for/i })).toHaveValue('8')
  })

  it('changes the status and score', async () => {
    const { user } = renderWithClient(<WatchlistRow entry={makeEntry()} />)

    await user.selectOptions(screen.getByRole('combobox', { name: /status for/i }), 'paused')
    await user.selectOptions(screen.getByRole('combobox', { name: /your score for/i }), '9')

    await waitFor(() =>
      expect(callsWith('PATCH').map(([, init]) => JSON.parse(init.body))).toEqual([
        { animeId: 154587, status: 'paused' },
        { animeId: 154587, score: 9 },
      ]),
    )
  })

  it('removes the anime from the list', async () => {
    const { user } = renderWithClient(<WatchlistRow entry={makeEntry()} />)

    await user.click(screen.getByRole('button', { name: /remove .* from list/i }))

    await waitFor(() => expect(callsWith('DELETE')).toHaveLength(1))
    expect(callsWith('DELETE')[0][0]).toBe('/api/watchlist?animeId=154587')
  })
})
