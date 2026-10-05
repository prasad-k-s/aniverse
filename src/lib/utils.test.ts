import {
  formatRelativeTime,
  formatScore,
  formatSeason,
  getCurrentSeason,
  getInitials,
  getTitle,
  stripHtml,
  truncate,
} from './utils'

describe('getTitle', () => {
  it('prefers the English title', () => {
    expect(getTitle({ english: 'Frieren', romaji: 'Sousou no Frieren', native: null })).toBe(
      'Frieren',
    )
  })

  it('falls back to romaji, then native', () => {
    expect(getTitle({ english: null, romaji: 'Sousou no Frieren', native: '葬送' })).toBe(
      'Sousou no Frieren',
    )
    expect(getTitle({ english: null, romaji: null, native: '葬送' })).toBe('葬送')
    expect(getTitle({ english: null, romaji: null, native: null })).toBe('Untitled')
  })
})

describe('formatScore', () => {
  it('converts AniList 0-100 scores to one decimal out of 10', () => {
    expect(formatScore(86)).toBe('8.6')
    expect(formatScore(90)).toBe('9.0')
    expect(formatScore(null)).toBeNull()
  })
})

describe('stripHtml', () => {
  it('turns <br> into new lines and removes tags and entities', () => {
    expect(stripHtml('Line one<br><br>Line <i>two</i> &amp; &quot;three&quot;')).toBe(
      'Line one\n\nLine two & "three"',
    )
  })

  it('handles empty descriptions', () => {
    expect(stripHtml(null)).toBe('')
  })
})

describe('getCurrentSeason', () => {
  it.each([
    ['2026-01-15', 'WINTER'],
    ['2026-05-01', 'SPRING'],
    ['2026-08-20', 'SUMMER'],
    ['2026-10-02', 'FALL'],
  ])('%s is %s', (date, season) => {
    expect(getCurrentSeason(new Date(date))).toEqual({ season, year: 2026 })
  })
})

describe('formatSeason', () => {
  it('formats a season and year', () => {
    expect(formatSeason('FALL', 2023)).toBe('Fall 2023')
    expect(formatSeason(null, 2023)).toBe('2023')
    expect(formatSeason(null, null)).toBeNull()
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-02T12:00:00Z')

  it('describes recent times', () => {
    expect(formatRelativeTime('2026-10-02T11:59:50Z', now)).toBe('just now')
    expect(formatRelativeTime('2026-10-02T11:55:00Z', now)).toBe('5 minutes ago')
    expect(formatRelativeTime('2026-10-01T12:00:00Z', now)).toBe('yesterday')
  })
})

describe('small helpers', () => {
  it('truncates long text with an ellipsis', () => {
    expect(truncate('Hello world', 6)).toBe('Hello…')
    expect(truncate('Hi', 6)).toBe('Hi')
  })

  it('builds initials', () => {
    expect(getInitials('Prasad Sankar')).toBe('PS')
    expect(getInitials(null)).toBe('?')
  })
})
