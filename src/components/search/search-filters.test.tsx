import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useUiStore } from '@/store/ui-store'
import { SearchFilters } from './search-filters'

const replace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/search',
}))

describe('SearchFilters', () => {
  beforeEach(() => {
    replace.mockClear()
    useUiStore.setState({ view: 'grid', recentSearches: [] })
  })

  it('updates the URL after the user stops typing', async () => {
    const user = userEvent.setup()
    render(<SearchFilters filters={{}} />)

    await user.type(screen.getByRole('searchbox', { name: 'Search anime' }), 'frieren')

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/search?q=frieren', { scroll: false }),
    )
    // Debounced: one URL update for the whole word, not one per letter
    expect(replace).toHaveBeenCalledTimes(1)
  })

  it('keeps existing filters when another one changes', async () => {
    const user = userEvent.setup()
    render(<SearchFilters filters={{ q: 'naruto', year: 2002 }} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Genre' }), 'Action')

    expect(replace).toHaveBeenCalledWith('/search?q=naruto&genre=Action&year=2002', {
      scroll: false,
    })
  })

  it('clears all filters', async () => {
    const user = userEvent.setup()
    render(<SearchFilters filters={{ genre: 'Action' }} />)

    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(replace).toHaveBeenCalledWith('/search', { scroll: false })
  })

  it('switches between grid and list view', async () => {
    const user = userEvent.setup()
    render(<SearchFilters filters={{}} />)

    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(useUiStore.getState().view).toBe('list')
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows recent searches and lets the user reuse one', async () => {
    useUiStore.setState({ recentSearches: ['one piece'] })
    const user = userEvent.setup()
    render(<SearchFilters filters={{}} />)

    await user.click(screen.getByRole('button', { name: 'one piece' }))
    expect(screen.getByRole('searchbox', { name: 'Search anime' })).toHaveValue('one piece')
  })

  it('follows the URL when it changes from outside (e.g. back button)', () => {
    const { rerender } = render(<SearchFilters filters={{ q: 'one piece' }} />)
    expect(screen.getByRole('searchbox', { name: 'Search anime' })).toHaveValue('one piece')

    rerender(<SearchFilters filters={{}} />)
    expect(screen.getByRole('searchbox', { name: 'Search anime' })).toHaveValue('')

    rerender(<SearchFilters filters={{ q: 'naruto' }} />)
    expect(screen.getByRole('searchbox', { name: 'Search anime' })).toHaveValue('naruto')
    expect(replace).not.toHaveBeenCalled()
  })
})
