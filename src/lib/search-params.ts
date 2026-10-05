import type { MediaFormat, MediaSort, SearchFilters } from '@/lib/anilist/types'
import { FIRST_YEAR, FORMATS, GENRES, SORT_OPTIONS } from '@/lib/constants'

const formatValues = new Set<string>(FORMATS.map((f) => f.value))
const sortValues = new Set<string>(SORT_OPTIONS.map((s) => s.value))
const genreValues = new Set<string>(GENRES)

/**
 * The URL is the source of truth for search filters, so results can be shared
 * and the back button works. Unknown or invalid values are ignored.
 */
export function parseSearchParams(params: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {}

  const q = params.get('q')?.trim()
  if (q) filters.q = q.slice(0, 100)

  const genre = params.get('genre')
  if (genre && genreValues.has(genre)) filters.genre = genre

  const year = Number(params.get('year'))
  if (Number.isInteger(year) && year >= FIRST_YEAR && year <= new Date().getFullYear() + 1) {
    filters.year = year
  }

  const format = params.get('format')
  if (format && formatValues.has(format)) filters.format = format as MediaFormat

  const sort = params.get('sort')
  if (sort && sortValues.has(sort)) filters.sort = sort as MediaSort

  return filters
}

/** Builds a query string from filters, leaving out empty values. */
export function toSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.genre) params.set('genre', filters.genre)
  if (filters.year) params.set('year', String(filters.year))
  if (filters.format) params.set('format', filters.format)
  if (filters.sort) params.set('sort', filters.sort)
  return params
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return Boolean(filters.q || filters.genre || filters.year || filters.format || filters.sort)
}
