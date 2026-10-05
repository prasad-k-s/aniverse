import type { AnimeCardData } from '@/lib/anilist/types'
import type { WatchlistEntry } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

export const frieren: AnimeCardData = {
  id: 154587,
  title: {
    romaji: 'Sousou no Frieren',
    english: "Frieren: Beyond Journey's End",
    native: '葬送のフリーレン',
  },
  coverImage: {
    large: 'https://s4.anilist.co/file/frieren-large.jpg',
    extraLarge: 'https://s4.anilist.co/file/frieren-xl.jpg',
    color: '#d6f1e4',
  },
  averageScore: 91,
  format: 'TV',
  episodes: 28,
  seasonYear: 2023,
  status: 'FINISHED',
  genres: ['Adventure', 'Drama', 'Fantasy'],
}

export const testUser = {
  id: 'user-1',
  email: 'prasad@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
} as User

export function makeEntry(overrides: Partial<WatchlistEntry> = {}): WatchlistEntry {
  return {
    user_id: testUser.id,
    anime_id: frieren.id,
    status: 'watching',
    progress: 3,
    score: null,
    title: "Frieren: Beyond Journey's End",
    cover_image: frieren.coverImage.large,
    episodes: 28,
    format: 'TV',
    updated_at: '2026-10-01T10:00:00.000Z',
    ...overrides,
  }
}
