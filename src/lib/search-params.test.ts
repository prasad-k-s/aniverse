import { hasActiveFilters, parseSearchParams, toSearchParams } from './search-params'

describe('parseSearchParams', () => {
  it('reads valid filters from the URL', () => {
    const params = new URLSearchParams(
      'q=frieren&genre=Fantasy&year=2023&format=TV&sort=SCORE_DESC',
    )
    expect(parseSearchParams(params)).toEqual({
      q: 'frieren',
      genre: 'Fantasy',
      year: 2023,
      format: 'TV',
      sort: 'SCORE_DESC',
    })
  })

  it('ignores invalid values', () => {
    const params = new URLSearchParams('genre=Cooking&year=abc&format=PODCAST&sort=RANDOM&q=%20%20')
    expect(parseSearchParams(params)).toEqual({})
  })
})

describe('toSearchParams', () => {
  it('leaves out empty filters', () => {
    expect(toSearchParams({ q: 'naruto', genre: undefined, year: 2002 }).toString()).toBe(
      'q=naruto&year=2002',
    )
  })

  it('round-trips with parseSearchParams', () => {
    const filters = { q: 'one piece', genre: 'Adventure', sort: 'TRENDING_DESC' as const }
    expect(parseSearchParams(toSearchParams(filters))).toEqual(filters)
  })
})

describe('hasActiveFilters', () => {
  it('is false for an empty search', () => {
    expect(hasActiveFilters({})).toBe(false)
    expect(hasActiveFilters({ genre: 'Action' })).toBe(true)
  })
})
