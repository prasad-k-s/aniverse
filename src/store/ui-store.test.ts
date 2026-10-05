import { act } from '@testing-library/react'
import { addRecentSearch, MAX_RECENT_SEARCHES, useUiStore } from './ui-store'

describe('addRecentSearch', () => {
  it('adds the newest search first', () => {
    expect(addRecentSearch(['naruto'], 'frieren')).toEqual(['frieren', 'naruto'])
  })

  it('moves a repeated search to the top, ignoring case', () => {
    expect(addRecentSearch(['naruto', 'Frieren'], 'frieren')).toEqual(['frieren', 'naruto'])
  })

  it(`keeps at most ${MAX_RECENT_SEARCHES} searches and ignores blanks`, () => {
    const full = ['a', 'b', 'c', 'd', 'e']
    expect(addRecentSearch(full, 'f')).toEqual(['f', 'a', 'b', 'c', 'd'])
    expect(addRecentSearch(full, '   ')).toBe(full)
  })
})

describe('useUiStore', () => {
  beforeEach(() => useUiStore.setState({ view: 'grid', recentSearches: [] }))

  it('switches the results view and remembers searches', () => {
    act(() => {
      useUiStore.getState().setView('list')
      useUiStore.getState().rememberSearch('One Piece')
    })
    expect(useUiStore.getState().view).toBe('list')
    expect(useUiStore.getState().recentSearches).toEqual(['One Piece'])

    act(() => useUiStore.getState().clearRecentSearches())
    expect(useUiStore.getState().recentSearches).toEqual([])
  })
})
