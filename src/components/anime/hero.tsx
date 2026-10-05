import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TrendingAnime } from '@/lib/anilist/types'
import { formatFormat, getTitle, stripHtml, truncate } from '@/lib/utils'
import { ScoreBadge } from './score-badge'

/** Full-width banner for the #1 trending anime. */
export function Hero({ anime }: { anime: TrendingAnime }) {
  const title = getTitle(anime.title)
  const image = anime.bannerImage ?? anime.coverImage.extraLarge

  return (
    <section className="relative isolate overflow-hidden border-b">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-60"
        />
      )}
      <div className="from-background via-background/80 to-background/20 absolute inset-0 -z-10 bg-gradient-to-t" />
      <div className="from-background/90 via-background/40 absolute inset-0 -z-10 bg-gradient-to-r to-transparent" />

      <div className="mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end gap-4 px-4 py-10 sm:min-h-[480px] sm:px-6 sm:py-14">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          #1 Trending now
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <ScoreBadge score={anime.averageScore} className="text-sm" />
          <Badge variant="secondary">{formatFormat(anime.format)}</Badge>
          {anime.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="outline">
              {genre}
            </Badge>
          ))}
        </div>
        {anime.description && (
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            {truncate(stripHtml(anime.description).replace(/\s+/g, ' '), 220)}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <Link href={`/anime/${anime.id}`}>View details</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/search">Browse anime</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
