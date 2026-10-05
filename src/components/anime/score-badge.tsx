import { StarIcon } from 'lucide-react'
import { cn, formatScore } from '@/lib/utils'

export function ScoreBadge({ score, className }: { score: number | null; className?: string }) {
  const value = formatScore(score)
  if (!value) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur',
        className,
      )}
      aria-label={`Rated ${value} out of 10`}
    >
      <StarIcon className="fill-star text-star size-3" aria-hidden />
      {value}
    </span>
  )
}
