/**
 * GraphQL documents for the AniList API (https://docs.anilist.co).
 * `gql` is only a marker so editors can highlight the GraphQL; it returns the string as-is.
 */
const gql = String.raw

export const CARD_FIELDS = gql`
  fragment CardFields on Media {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      extraLarge
      color
    }
    averageScore
    format
    episodes
    seasonYear
    status
    genres
  }
`

/** Home page: three lists in a single request (aliases), to stay well inside AniList's rate limit. */
export const HOME_QUERY = gql`
  query HomePage($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
    trending: Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: [TRENDING_DESC], isAdult: false) {
        ...CardFields
        bannerImage
        description(asHtml: false)
      }
    }
    season: Page(page: 1, perPage: $perPage) {
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ...CardFields
      }
    }
    top: Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: [SCORE_DESC], isAdult: false) {
        ...CardFields
      }
    }
  }
  ${CARD_FIELDS}
`

export const SEARCH_QUERY = gql`
  query SearchAnime(
    $page: Int
    $perPage: Int
    $search: String
    $genre: String
    $seasonYear: Int
    $format: MediaFormat
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(
        type: ANIME
        isAdult: false
        search: $search
        genre: $genre
        seasonYear: $seasonYear
        format: $format
        sort: $sort
      ) {
        ...CardFields
      }
    }
  }
  ${CARD_FIELDS}
`

export const ANIME_QUERY = gql`
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      ...CardFields
      bannerImage
      description(asHtml: false)
      season
      duration
      popularity
      favourites
      source
      startDate {
        year
        month
        day
      }
      studios(isMain: true) {
        nodes {
          id
          name
        }
      }
      trailer {
        id
        site
      }
      nextAiringEpisode {
        episode
        airingAt
      }
      characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
      recommendations(perPage: 6, sort: [RATING_DESC]) {
        nodes {
          mediaRecommendation {
            ...CardFields
          }
        }
      }
    }
  }
  ${CARD_FIELDS}
`
