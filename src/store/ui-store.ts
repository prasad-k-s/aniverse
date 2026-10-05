import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ResultsView = 'grid' | 'list'
export const MAX_RECENT_SEARCHES = 5

/** Newest first, no duplicates (case-insensitive), at most 5 entries. */
export function addRecentSearch(list: string[], query: string): string[] {
  const value = query.trim()
  if (!value) return list
  const rest = list.filter((item) => item.toLowerCase() !== value.toLowerCase())
  return [value, ...rest].slice(0, MAX_RECENT_SEARCHES)
}

interface UiState {
  view: ResultsView
  recentSearches: string[]
  setView: (view: ResultsView) => void
  rememberSearch: (query: string) => void
  clearRecentSearches: () => void
}

/**
 * Small client-only UI preferences, saved in localStorage.
 * Server state (anime, watchlist) lives in React Query instead.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      view: 'grid',
      recentSearches: [],
      setView: (view) => set({ view }),
      rememberSearch: (query) =>
        set((state) => ({ recentSearches: addRecentSearch(state.recentSearches, query) })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'aniverse-ui',
      // Rehydrated after mount (see Providers) so server and client HTML match
      skipHydration: true,
    },
  ),
)
