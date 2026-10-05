import { AnimeSection } from '@/components/anime/anime-section'
import { Hero } from '@/components/anime/hero'
import { getHomeData } from '@/lib/anilist/api'
import type { HomeData } from '@/lib/anilist/types'
import { formatSeason, getCurrentSeason } from '@/lib/utils'

// Incremental Static Regeneration: the page is pre-rendered and rebuilt at most once an hour
export const revalidate = 3600

export default async function HomePage() {
  const { season, year } = getCurrentSeason()
  let data: HomeData | null = null
  try {
    data = await getHomeData()
  } catch (error) {
    // Don't fail the build (or the page) if AniList is briefly unavailable
    console.error('Failed to load home data from AniList', error)
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Anime data is taking a break</h1>
        <p className="text-muted-foreground mt-2">
          We couldn&apos;t reach AniList right now. Please refresh in a minute.
        </p>
      </div>
    )
  }

  const featured = data.trending.media.find((anime) => anime.bannerImage) ?? data.trending.media[0]

  return (
    <>
      {featured && <Hero anime={featured} />}
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        <AnimeSection
          title="Trending now"
          href="/search?sort=TRENDING_DESC"
          items={data.trending.media}
        />
        <AnimeSection
          title="Popular this season"
          subtitle={formatSeason(season, year) ?? undefined}
          href={`/search?year=${year}&sort=POPULARITY_DESC`}
          items={data.season.media}
        />
        <AnimeSection
          title="All-time favourites"
          subtitle="Highest rated on AniList"
          href="/search?sort=SCORE_DESC"
          items={data.top.media}
        />
      </div>
    </>
  )
}
