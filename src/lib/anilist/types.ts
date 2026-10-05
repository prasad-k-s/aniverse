/** Types for the parts of the AniList GraphQL schema this app uses. */

export type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC'
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS'
export type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'
export type MediaSort = 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'START_DATE_DESC'

export interface MediaTitle {
  romaji: string | null
  english: string | null
  native: string | null
}

/** The fields shown on an anime card (see the CardFields fragment). */
export interface AnimeCardData {
  id: number
  title: MediaTitle
  coverImage: { large: string | null; extraLarge: string | null; color: string | null }
  averageScore: number | null
  format: MediaFormat | null
  episodes: number | null
  seasonYear: number | null
  status: MediaStatus | null
  genres: string[]
}

export interface TrendingAnime extends AnimeCardData {
  bannerImage: string | null
  description: string | null
}

export interface AnimeDetail extends AnimeCardData {
  bannerImage: string | null
  description: string | null
  season: MediaSeason | null
  duration: number | null
  popularity: number | null
  favourites: number | null
  source: string | null
  startDate: { year: number | null; month: number | null; day: number | null }
  studios: { nodes: { id: number; name: string }[] }
  trailer: { id: string; site: string } | null
  nextAiringEpisode: { episode: number; airingAt: number } | null
  characters: {
    edges: {
      role: string
      node: { id: number; name: { full: string }; image: { large: string | null } }
    }[]
  }
  recommendations: {
    nodes: { mediaRecommendation: AnimeCardData | null }[]
  }
}

export interface PageInfo {
  hasNextPage: boolean
  currentPage: number
}

export interface HomeData {
  trending: { media: TrendingAnime[] }
  season: { media: AnimeCardData[] }
  top: { media: AnimeCardData[] }
}

export interface SearchData {
  Page: { pageInfo: PageInfo; media: AnimeCardData[] }
}

export interface AnimeData {
  Media: AnimeDetail | null
}

export interface SearchFilters {
  q?: string
  genre?: string
  year?: number
  format?: MediaFormat
  sort?: MediaSort
}
