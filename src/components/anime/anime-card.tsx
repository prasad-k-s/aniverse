import Image from 'next/image'
import Link from 'next/link'
import type { AnimeCardData } from '@/lib/anilist/types'
import { cn, formatFormat, getTitle } from '@/lib/utils'
import { ScoreBadge } from './score-badge'

interface AnimeCardProps {
  anime: AnimeCardData
  /** Load the image eagerly (for cards above the fold) */
  priority?: boolean
  className?: string
}

export function AnimeCard({ anime, priority = false, className }: AnimeCardProps) {
  const title = getTitle(anime.title)
  const meta = [
    formatFormat(anime.format),
    anime.seasonYear,
    anime.episodes ? `${anime.episodes} eps` : null,
  ].filter((part) => part && part !== '—')

  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn(
        'group focus-visible:ring-ring/50 block snap-start rounded-lg outline-none focus-visible:ring-[3px]',
        className,
      )}
    >
      <div
        className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm"
        style={{ backgroundColor: anime.coverImage.color ?? undefined }}
      >
        {anime.coverImage.large && (
          <Image
            src={anime.coverImage.extraLarge ?? anime.coverImage.large}
            alt=""
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 45vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <ScoreBadge score={anime.averageScore} className="absolute top-2 right-2" />
      </div>
      <h3 className="group-hover:text-primary mt-2 line-clamp-2 text-sm leading-snug font-semibold">
        {title}
      </h3>
      <p className="text-muted-foreground mt-0.5 text-xs">{meta.join(' · ')}</p>
    </Link>
  )
}
