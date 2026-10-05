import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import type { AnimeCardData } from '@/lib/anilist/types'
import { AnimeCard } from './anime-card'

interface AnimeSectionProps {
  title: string
  subtitle?: string
  href: string
  items: AnimeCardData[]
}

/** A titled, horizontally scrolling row of anime cards. */
export function AnimeSection({ title, subtitle, href, items }: AnimeSectionProps) {
  if (items.length === 0) return null
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-heading`

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={headingId} className="text-xl font-bold sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="text-primary flex shrink-0 items-center text-sm font-medium hover:underline"
        >
          See all <ChevronRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="-mx-4 grid snap-x snap-mandatory scrollbar-none auto-cols-[42%] grid-flow-col gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:auto-cols-[28%] sm:px-0 md:auto-cols-[22%] lg:auto-cols-[calc((100%-5rem)/6)]">
        {items.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  )
}
