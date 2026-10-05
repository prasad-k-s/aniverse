import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div role="status" aria-label="Loading anime">
      <Skeleton className="h-48 w-full rounded-none sm:h-64 lg:h-80" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-[220px_1fr] md:gap-10">
        <Skeleton className="mx-auto -mt-24 aspect-[2/3] w-40 rounded-xl sm:-mt-32 sm:w-48 md:w-full" />
        <div className="space-y-4 md:pt-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
