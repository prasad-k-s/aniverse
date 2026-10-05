import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CalendarIcon, PlayIcon } from 'lucide-react'
import { AnimeCard } from '@/components/anime/anime-card'
import { Characters } from '@/components/anime/characters'
import { ScoreBadge } from '@/components/anime/score-badge'
import { CommentsSection } from '@/components/comments/comments-section'
import { ReviewsSection } from '@/components/reviews/reviews-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WatchlistButton } from '@/components/watchlist/watchlist-button'
import { getAnime } from '@/lib/anilist/api'
import { parseId } from '@/lib/params'
import {
  formatFormat,
  formatSeason,
  formatStatus,
  getTitle,
  stripHtml,
  truncate,
} from '@/lib/utils'

// AniList data is cached and the page re-generated at most once an hour (ISR).
// User content (list status, reviews, comments) loads on the client.
export const revalidate = 3600

// Pages are generated on first visit, then served from the cache
export async function generateStaticParams() {
  return []
}

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = parseId((await params).id)
  const anime = id ? await getAnime(id).catch(() => null) : null
  if (!anime) return { title: 'Anime not found' }

  const title = getTitle(anime.title)
  const description = truncate(stripHtml(anime.description).replace(/\s+/g, ' '), 160)
  const image = anime.bannerImage ?? anime.coverImage.extraLarge

  return {
    title,
    description,
    alternates: { canonical: `/anime/${anime.id}` },
    openGraph: { title, description, images: image ? [image] : [] },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] },
  }
}

export default async function AnimePage({ params }: PageProps) {
  const id = parseId((await params).id)
  if (!id) notFound()
  const anime = await getAnime(id)
  if (!anime) notFound()

  const title = getTitle(anime.title)
  const synopsis = stripHtml(anime.description)
  const studio = anime.studios.nodes[0]?.name
  const recommendations = anime.recommendations.nodes
    .map((node) => node.mediaRecommendation)
    .filter((media) => media !== null)

  const details: [string, string | number | null | undefined][] = [
    ['Format', formatFormat(anime.format)],
    ['Episodes', anime.episodes],
    ['Duration', anime.duration ? `${anime.duration} min` : null],
    ['Status', formatStatus(anime.status)],
    ['Season', formatSeason(anime.season, anime.seasonYear)],
    ['Studio', studio],
    ['Source', anime.source ? anime.source.replace(/_/g, ' ').toLowerCase() : null],
    ['Popularity', anime.popularity?.toLocaleString('en-US')],
  ]

  return (
    <article>
      {/* Banner */}
      <div className="bg-muted relative h-48 overflow-hidden sm:h-64 lg:h-80">
        {anime.bannerImage && (
          <Image
            src={anime.bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="from-background absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:gap-10">
          {/* Sidebar */}
          <aside className="-mt-24 flex flex-col items-center gap-4 sm:-mt-32 md:items-stretch">
            <div
              className="border-background bg-muted relative aspect-[2/3] w-40 overflow-hidden rounded-xl border-4 shadow-xl sm:w-48 md:w-full"
              style={{ backgroundColor: anime.coverImage.color ?? undefined }}
            >
              {anime.coverImage.extraLarge && (
                <Image
                  src={anime.coverImage.extraLarge}
                  alt={`${title} cover`}
                  fill
                  priority
                  sizes="(min-width: 768px) 220px, 192px"
                  className="object-cover"
                />
              )}
            </div>
            <WatchlistButton
              animeId={anime.id}
              title={title}
              coverImage={anime.coverImage.large}
              episodes={anime.episodes}
              format={anime.format}
              className="max-w-xs md:max-w-none"
            />
            <dl className="bg-card hidden w-full space-y-3 rounded-xl border p-4 text-sm md:block">
              {details
                .filter(([, value]) => value !== null && value !== undefined && value !== '—')
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium capitalize">{value}</dd>
                  </div>
                ))}
            </dl>
          </aside>

          {/* Main column */}
          <div className="min-w-0 space-y-10 pb-16 md:pt-6">
            <header className="space-y-3 text-center md:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                {title}
              </h1>
              {anime.title.romaji && anime.title.romaji !== title && (
                <p className="text-muted-foreground">{anime.title.romaji}</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <ScoreBadge score={anime.averageScore} className="text-sm" />
                {anime.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
              {anime.nextAiringEpisode && (
                <p className="text-primary flex items-center justify-center gap-2 text-sm md:justify-start">
                  <CalendarIcon className="size-4" aria-hidden />
                  Episode {anime.nextAiringEpisode.episode} airs{' '}
                  {new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              )}
            </header>

            {/* Details for phones (the sidebar list is hidden there) */}
            <dl className="bg-card grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm sm:grid-cols-4 md:hidden">
              {details
                .filter(([, value]) => value !== null && value !== undefined && value !== '—')
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium capitalize">{value}</dd>
                  </div>
                ))}
            </dl>

            <section aria-labelledby="synopsis-heading" className="space-y-3">
              <h2 id="synopsis-heading" className="text-xl font-bold">
                Synopsis
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {synopsis || 'No synopsis available yet.'}
              </p>
              {anime.trailer?.site === 'youtube' && (
                <Button asChild variant="outline">
                  <a
                    href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PlayIcon /> Watch trailer
                  </a>
                </Button>
              )}
            </section>

            <Characters characters={anime.characters.edges} />

            {recommendations.length > 0 && (
              <section aria-labelledby="recommendations-heading">
                <h2 id="recommendations-heading" className="mb-4 text-xl font-bold">
                  If you liked this
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {recommendations.map((media) => (
                    <AnimeCard key={media.id} anime={media} />
                  ))}
                </div>
              </section>
            )}

            <ReviewsSection animeId={anime.id} animeTitle={title} />
            <CommentsSection animeId={anime.id} />
          </div>
        </div>
      </div>
    </article>
  )
}
