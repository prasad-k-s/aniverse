import type { MediaFormat, MediaSort } from '@/lib/anilist/types'
import type { WatchStatus } from '@/lib/supabase/database.types'

export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
] as const

export const FORMATS: { value: MediaFormat; label: string }[] = [
  { value: 'TV', label: 'TV' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'TV_SHORT', label: 'TV Short' },
]

export const SORT_OPTIONS: { value: MediaSort; label: string }[] = [
  { value: 'POPULARITY_DESC', label: 'Most popular' },
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'SCORE_DESC', label: 'Highest rated' },
  { value: 'START_DATE_DESC', label: 'Newest' },
]

export const FIRST_YEAR = 1970

export function getYears(now = new Date()): number[] {
  const years: number[] = []
  for (let year = now.getFullYear() + 1; year >= FIRST_YEAR; year--) years.push(year)
  return years
}

export const WATCH_STATUSES: { value: WatchStatus; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'planning', label: 'Plan to watch' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
]

export const WATCH_STATUS_LABELS = Object.fromEntries(
  WATCH_STATUSES.map((s) => [s.value, s.label]),
) as Record<WatchStatus, string>

/** Routes that need a signed-in user (checked in middleware) */
export const PROTECTED_ROUTES = ['/watchlist', '/settings']
