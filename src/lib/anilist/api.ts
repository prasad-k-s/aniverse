import { cache } from 'react'
import { getCurrentSeason } from '@/lib/utils'
import { anilistFetch, AniListError } from './client'
import { ANIME_QUERY, HOME_QUERY, SEARCH_QUERY } from './queries'
import type { AnimeData, AnimeDetail, HomeData, SearchData, SearchFilters } from './types'

/** Server data is cached for an hour (ISR); AniList data doesn't change faster than that. */
export const ANILIST_REVALIDATE = 3600
export const SEARCH_PAGE_SIZE = 24

export async function getHomeData(): Promise<HomeData> {
  const { season, year } = getCurrentSeason()
  return anilistFetch<HomeData>(
    HOME_QUERY,
    { season, seasonYear: year, perPage: 12 },
    { revalidate: ANILIST_REVALIDATE },
  )
}

/**
 * Wrapped in React's cache() so generateMetadata and the page share one request
 * (Next.js only de-duplicates GET fetches automatically, and GraphQL uses POST).
 */
export const getAnime = cache(async (id: number): Promise<AnimeDetail | null> => {
  try {
    const data = await anilistFetch<AnimeData>(
      ANIME_QUERY,
      { id },
      { revalidate: ANILIST_REVALIDATE },
    )
    return data.Media
  } catch (error) {
    if (error instanceof AniListError && error.status === 404) return null
    throw error
  }
})

/** Used from the browser by the search page (React Query handles caching there). */
export async function searchAnime(filters: SearchFilters, page: number, signal?: AbortSignal) {
  const data = await anilistFetch<SearchData>(
    SEARCH_QUERY,
    {
      page,
      perPage: SEARCH_PAGE_SIZE,
      search: filters.q || undefined,
      genre: filters.genre || undefined,
      seasonYear: filters.year || undefined,
      format: filters.format || undefined,
      sort: [filters.sort ?? 'POPULARITY_DESC'],
    },
    { signal },
  )
  return data.Page
}
