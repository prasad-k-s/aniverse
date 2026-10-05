'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2Icon, SearchXIcon } from 'lucide-react'
import { AnimeCard } from '@/components/anime/anime-card'
import { AnimeGridSkeleton } from '@/components/anime/anime-card-skeleton'
import { AnimeListItem } from '@/components/anime/anime-list-item'
import { Button } from '@/components/ui/button'
import { useAnimeSearch } from '@/hooks/use-anime-search'
import { parseSearchParams } from '@/lib/search-params'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui-store'
import { SearchFilters } from './search-filters'

export function SearchView() {
  const searchParams = useSearchParams()
  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams])
  const view = useUiStore((state) => state.view)

  const {
    data,
    error,
    isPending,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAnimeSearch(filters)

  const results = useMemo(() => data?.pages.flatMap((page) => page.media) ?? [], [data])

  // Infinite scroll: load the next page when the sentinel below the results comes into view
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = sentinelRef.current
    if (!element || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) void fetchNextPage()
      },
      { rootMargin: '600px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="space-y-6">
      <SearchFilters filters={filters} />

      {isPending ? (
        <AnimeGridSkeleton count={18} />
      ) : error && results.length === 0 ? (
        <div
          className="border-destructive/40 bg-destructive/5 rounded-lg border p-6 text-center"
          role="alert"
        >
          <p className="font-medium">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center">
          <SearchXIcon className="text-muted-foreground mx-auto size-10" aria-hidden />
          <p className="mt-3 font-medium">No anime found</p>
          <p className="text-muted-foreground text-sm">Try a different title or fewer filters.</p>
        </div>
      ) : (
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} priority={i < 6} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {results.map((anime) => (
                <AnimeListItem key={anime.id} anime={anime} />
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="flex justify-center py-8">
            {isFetchingNextPage ? (
              <Loader2Icon
                className="text-muted-foreground size-6 animate-spin"
                aria-label="Loading more"
              />
            ) : hasNextPage ? (
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Load more
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">You&apos;ve reached the end.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
