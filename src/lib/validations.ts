import { z } from 'zod'

export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_REGEX, '3-20 characters: lowercase letters, numbers and underscores')

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z
  .object({
    username,
    email,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain a letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  username,
  displayName: z.string().trim().max(50, 'Display name can be at most 50 characters'),
  bio: z.string().trim().max(200, 'Bio can be at most 200 characters'),
})

export const reviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Choose a rating' })
    .int()
    .min(1, 'Choose a rating')
    .max(10),
  body: z
    .string()
    .trim()
    .min(20, 'Write at least 20 characters')
    .max(2000, 'Reviews can be at most 2000 characters'),
})

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Write something first')
    .max(500, 'Comments can be at most 500 characters'),
})

export const watchStatusSchema = z.enum(['watching', 'completed', 'planning', 'paused', 'dropped'])

/** POST /api/watchlist */
export const watchlistAddSchema = z.object({
  animeId: z.number().int().positive(),
  status: watchStatusSchema,
  title: z.string().trim().min(1).max(300),
  coverImage: z.string().url().nullable(),
  episodes: z.number().int().positive().nullable(),
  format: z.string().max(20).nullable(),
})

/** PATCH /api/watchlist */
export const watchlistUpdateSchema = z
  .object({
    animeId: z.number().int().positive(),
    status: watchStatusSchema.optional(),
    score: z.number().int().min(1).max(10).nullable().optional(),
  })
  .refine((data) => data.status !== undefined || data.score !== undefined, {
    message: 'Nothing to update',
  })

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type ReviewValues = z.infer<typeof reviewSchema>
export type CommentValues = z.infer<typeof commentSchema>
export type WatchlistAddInput = z.infer<typeof watchlistAddSchema>
export type WatchlistUpdateInput = z.infer<typeof watchlistUpdateSchema>
