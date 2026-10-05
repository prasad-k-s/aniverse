import {
  profileSchema,
  reviewSchema,
  signupSchema,
  watchlistAddSchema,
  watchlistUpdateSchema,
} from './validations'

describe('signupSchema', () => {
  const valid = {
    username: 'prasad_ks',
    email: 'prasad@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
  }

  it('accepts valid details and lowercases the username', () => {
    const result = signupSchema.parse({ ...valid, username: 'Prasad_KS' })
    expect(result.username).toBe('prasad_ks')
  })

  it('rejects usernames with spaces or symbols', () => {
    expect(signupSchema.safeParse({ ...valid, username: 'prasad k' }).success).toBe(false)
    expect(signupSchema.safeParse({ ...valid, username: 'ab' }).success).toBe(false)
  })

  it('requires matching passwords', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'secret124' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['confirmPassword'])
  })
})

describe('reviewSchema', () => {
  it('requires a rating between 1 and 10 and at least 20 characters', () => {
    expect(reviewSchema.safeParse({ rating: 0, body: 'Too short' }).success).toBe(false)
    expect(reviewSchema.safeParse({ rating: 11, body: 'x'.repeat(30) }).success).toBe(false)
    expect(reviewSchema.safeParse({ rating: 9, body: 'A beautiful, quiet fantasy.' }).success).toBe(
      true,
    )
  })
})

describe('profileSchema', () => {
  it('limits the bio to 200 characters', () => {
    const base = { username: 'prasad', displayName: 'Prasad' }
    expect(profileSchema.safeParse({ ...base, bio: 'x'.repeat(200) }).success).toBe(true)
    expect(profileSchema.safeParse({ ...base, bio: 'x'.repeat(201) }).success).toBe(false)
  })
})

describe('watchlist API schemas', () => {
  it('validates new entries', () => {
    const entry = {
      animeId: 1,
      status: 'watching',
      title: 'Frieren',
      coverImage: 'https://s4.anilist.co/x.jpg',
      episodes: 28,
      format: 'TV',
    }
    expect(watchlistAddSchema.safeParse(entry).success).toBe(true)
    expect(watchlistAddSchema.safeParse({ ...entry, status: 'binged' }).success).toBe(false)
  })

  it('needs at least one field to update', () => {
    expect(watchlistUpdateSchema.safeParse({ animeId: 1 }).success).toBe(false)
    expect(watchlistUpdateSchema.safeParse({ animeId: 1, status: 'paused' }).success).toBe(true)
    expect(watchlistUpdateSchema.safeParse({ animeId: 1, score: null }).success).toBe(true)
  })
})
