import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MediaFormat, MediaSeason, MediaStatus, MediaTitle } from '@/lib/anilist/types'

/** Merges Tailwind classes, letting later classes win (shadcn/ui helper). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** English title first (most readable for the audience), then romaji, then native. */
export function getTitle(title: MediaTitle): string {
  return title.english || title.romaji || title.native || 'Untitled'
}

const FORMAT_LABELS: Record<MediaFormat, string> = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
}

export function formatFormat(format: MediaFormat | null | undefined): string {
  return format ? FORMAT_LABELS[format] : '—'
}

const STATUS_LABELS: Record<MediaStatus, string> = {
  FINISHED: 'Finished',
  RELEASING: 'Airing',
  NOT_YET_RELEASED: 'Upcoming',
  CANCELLED: 'Cancelled',
  HIATUS: 'On hiatus',
}

export function formatStatus(status: MediaStatus | null | undefined): string {
  return status ? STATUS_LABELS[status] : '—'
}

/** AniList scores are 0-100; we show them out of 10, e.g. 86 -> "8.6". */
export function formatScore(score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null
  return (score / 10).toFixed(1)
}

export function formatSeason(season: MediaSeason | null, year: number | null): string | null {
  if (!season && !year) return null
  const name = season ? season.charAt(0) + season.slice(1).toLowerCase() : ''
  return [name, year].filter(Boolean).join(' ')
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
}

/** AniList descriptions contain <br>, <i> and HTML entities; we render plain text. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&[#a-z0-9]+;/gi, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text
}

/** The anime season a date falls in (Winter = Jan-Mar, Spring = Apr-Jun, ...). */
export function getCurrentSeason(date = new Date()): { season: MediaSeason; year: number } {
  const seasons: MediaSeason[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  return { season: seasons[Math.floor(date.getMonth() / 3)], year: date.getFullYear() }
}

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

/** "3 minutes ago", "yesterday", "just now" */
export function formatRelativeTime(date: string | Date, now = new Date()): string {
  const seconds = Math.round((new Date(date).getTime() - now.getTime()) / 1000)
  for (const [unit, unitSeconds] of UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit)
    }
  }
  return 'just now'
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
