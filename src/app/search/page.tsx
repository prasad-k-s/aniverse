import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AnimeGridSkeleton } from '@/components/anime/anime-card-skeleton'
import { SearchView } from '@/components/search/search-view'

export const metadata: Metadata = {
  title: 'Browse anime',
  description: 'Search thousands of anime by title, genre, year and format.',
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Browse anime</h1>
      {/* useSearchParams needs a Suspense boundary so the page shell can be pre-rendered */}
      <Suspense fallback={<AnimeGridSkeleton count={18} />}>
        <SearchView />
      </Suspense>
    </div>
  )
}
