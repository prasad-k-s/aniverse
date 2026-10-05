'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HistoryIcon, LayoutGridIcon, ListIcon, SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { useDebounce } from '@/hooks/use-debounce'
import type { MediaFormat, MediaSort, SearchFilters as Filters } from '@/lib/anilist/types'
import { FORMATS, GENRES, getYears, SORT_OPTIONS } from '@/lib/constants'
import { hasActiveFilters, toSearchParams } from '@/lib/search-params'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui-store'

const YEARS = getYears()

export function SearchFilters({ filters }: { filters: Filters }) {
  const router = useRouter()
  const pathname = usePathname()
  const { view, setView, recentSearches, rememberSearch, clearRecentSearches } = useUiStore()

  // The text box updates instantly; the URL (and the API call) waits until typing pauses
  const [query, setQuery] = useState(filters.q ?? '')
  const debouncedQuery = useDebounce(query.trim(), 400)
  // The last search text we put in the URL ourselves
  const lastUrlQuery = useRef(filters.q ?? '')

  // Keep the box in sync when the URL changes from outside (back button, header search link...)
  useEffect(() => {
    const urlQuery = filters.q ?? ''
    if (urlQuery !== lastUrlQuery.current) {
      lastUrlQuery.current = urlQuery
      setQuery(urlQuery)
    }
  }, [filters.q])

  const update = (changes: Partial<Filters>) => {
    if ('q' in changes) lastUrlQuery.current = changes.q ?? ''
    const params = toSearchParams({ ...filters, ...changes })
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  useEffect(() => {
    if (debouncedQuery !== (filters.q ?? '')) update({ q: debouncedQuery || undefined })
    // Only react to the debounced text, not to other filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  const reset = () => {
    lastUrlQuery.current = ''
    setQuery('')
    router.replace(pathname, { scroll: false })
  }

  return (
    <div className="space-y-3">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          rememberSearch(query)
          update({ q: query.trim() || undefined })
        }}
        className="relative"
      >
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => rememberSearch(query)}
          placeholder="Search anime, e.g. Frieren"
          aria-label="Search anime"
          className="h-12 pl-11 text-base"
        />
      </form>

      {!query && recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <HistoryIcon className="text-muted-foreground size-4" aria-hidden />
          <span className="text-muted-foreground">Recent:</span>
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="hover:bg-accent rounded-full border px-3 py-0.5"
            >
              {term}
            </button>
          ))}
          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-muted-foreground text-xs underline-offset-4 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
        <NativeSelect
          aria-label="Genre"
          value={filters.genre ?? ''}
          onChange={(e) => update({ genre: e.target.value || undefined })}
          className="lg:w-44"
        >
          <option value="">Any genre</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Year"
          value={filters.year ?? ''}
          onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : undefined })}
          className="lg:w-32"
        >
          <option value="">Any year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Format"
          value={filters.format ?? ''}
          onChange={(e) =>
            update({ format: (e.target.value || undefined) as MediaFormat | undefined })
          }
          className="lg:w-36"
        >
          <option value="">Any format</option>
          {FORMATS.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Sort by"
          value={filters.sort ?? 'POPULARITY_DESC'}
          onChange={(e) => update({ sort: e.target.value as MediaSort })}
          className="lg:w-44"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>

        <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-4 lg:ml-auto lg:justify-end">
          {hasActiveFilters(filters) ? (
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              <XIcon /> Clear filters
            </Button>
          ) : (
            <span />
          )}
          <div className="flex rounded-md border p-0.5" role="group" aria-label="Results layout">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('size-8', view === 'grid' && 'bg-accent')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <LayoutGridIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('size-8', view === 'list' && 'bg-accent')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <ListIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
