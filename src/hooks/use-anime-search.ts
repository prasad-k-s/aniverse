'use client'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { searchAnime } from '@/lib/anilist/api'
import type { SearchFilters } from '@/lib/anilist/types'

/** Paginated AniList search; the next page loads when the user scrolls to the bottom. */
export function useAnimeSearch(filters: SearchFilters) {
  return useInfiniteQuery({
    queryKey: ['search', filters],
    queryFn: ({ pageParam, signal }) => searchAnime(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.currentPage + 1 : undefined,
    // Keep showing the old results while a new filter loads, instead of flashing a skeleton
    placeholderData: keepPreviousData,
  })
}
