export const ANILIST_URL = 'https://graphql.anilist.co'

export class AniListError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'AniListError'
    this.status = status
  }
}

interface GraphQLResponse<TData> {
  data?: TData | null
  errors?: { message: string; status?: number }[]
}

interface FetchOptions {
  /** Next.js data cache: seconds to cache the response on the server (ignored in the browser) */
  revalidate?: number | false
  signal?: AbortSignal
}

/**
 * Minimal typed GraphQL client for AniList. Works in Server Components (with the
 * Next.js data cache) and in the browser (with React Query).
 */
export async function anilistFetch<TData>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate, signal }: FetchOptions = {},
): Promise<TData> {
  let response: Response
  try {
    response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal,
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new AniListError(0, 'Could not reach AniList. Check your connection and try again.')
  }

  const json = (await response.json().catch(() => null)) as GraphQLResponse<TData> | null
  const firstError = json?.errors?.[0]

  if (!response.ok || firstError) {
    const status = firstError?.status ?? response.status
    const message =
      status === 429
        ? 'AniList is receiving too many requests. Please wait a moment and try again.'
        : (firstError?.message ?? `AniList request failed (${response.status})`)
    throw new AniListError(status, message)
  }

  if (!json?.data) throw new AniListError(response.status, 'AniList returned an empty response.')
  return json.data
}
