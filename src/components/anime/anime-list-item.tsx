import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { AnimeCardData } from '@/lib/anilist/types'
import { formatFormat, formatStatus, getTitle } from '@/lib/utils'
import { ScoreBadge } from './score-badge'

/** Compact row used by the search page's list view. */
export function AnimeListItem({ anime }: { anime: AnimeCardData }) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group bg-card hover:bg-accent/50 flex gap-4 rounded-lg border p-3 transition-colors"
    >
      <div
        className="bg-muted relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md sm:w-20"
        style={{ backgroundColor: anime.coverImage.color ?? undefined }}
      >
        {anime.coverImage.large && (
          <Image src={anime.coverImage.large} alt="" fill sizes="80px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="group-hover:text-primary line-clamp-2 font-semibold">
            {getTitle(anime.title)}
          </h3>
          <ScoreBadge score={anime.averageScore} className="shrink-0" />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {[
            formatFormat(anime.format),
            anime.seasonYear,
            anime.episodes && `${anime.episodes} episodes`,
            formatStatus(anime.status),
          ]
            .filter((part) => part && part !== '—')
            .join(' · ')}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {anime.genres.slice(0, 4).map((genre) => (
            <Badge key={genre} variant="secondary">
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
