import { jsonResponse } from '@/test/render'
import { anilistFetch, AniListError, ANILIST_URL } from './client'

const fetchMock = jest.fn()

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock as unknown as typeof fetch
})

describe('anilistFetch', () => {
  it('POSTs the query and variables and returns data', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { Media: { id: 1 } } }))

    const data = await anilistFetch<{ Media: { id: number } }>('query { Media { id } }', { id: 1 })

    expect(data).toEqual({ Media: { id: 1 } })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(ANILIST_URL)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ query: 'query { Media { id } }', variables: { id: 1 } })
  })

  it('passes the Next.js revalidate option when given', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: {} }))
    await anilistFetch('query {}', {}, { revalidate: 3600 })
    expect(fetchMock.mock.calls[0][1].next).toEqual({ revalidate: 3600 })
  })

  it('turns GraphQL errors into an AniListError with the status', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { data: { Media: null }, errors: [{ message: 'Not Found.', status: 404 }] },
        404,
      ),
    )

    await expect(anilistFetch('query {}')).rejects.toMatchObject({
      name: 'AniListError',
      status: 404,
      message: 'Not Found.',
    })
  })

  it('shows a friendly message when rate limited', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ errors: [{ message: 'Too Many Requests.', status: 429 }] }, 429),
    )
    await expect(anilistFetch('query {}')).rejects.toThrow(/too many requests/i)
  })

  it('reports network failures', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const error: unknown = await anilistFetch('query {}').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(AniListError)
    expect((error as AniListError).status).toBe(0)
  })
})
