import { AnimeGridSkeleton } from '@/components/anime/anime-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6"
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="h-64 w-full rounded-xl" />
      <AnimeGridSkeleton />
    </div>
  )
}
