import { render, screen } from '@testing-library/react'
import { frieren } from '@/test/fixtures'
import { AnimeCard } from './anime-card'

describe('AnimeCard', () => {
  it('links to the anime page and shows title, score and details', () => {
    render(<AnimeCard anime={frieren} />)

    const link = screen.getByRole('link', { name: /frieren: beyond journey's end/i })
    expect(link).toHaveAttribute('href', '/anime/154587')
    expect(screen.getByLabelText('Rated 9.1 out of 10')).toBeInTheDocument()
    expect(screen.getByText('TV · 2023 · 28 eps')).toBeInTheDocument()
  })

  it('hides the score badge when AniList has no score yet', () => {
    render(<AnimeCard anime={{ ...frieren, averageScore: null, episodes: null }} />)
    expect(screen.queryByLabelText(/out of 10/)).not.toBeInTheDocument()
    expect(screen.getByText('TV · 2023')).toBeInTheDocument()
  })
})
