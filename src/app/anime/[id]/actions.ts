'use server'

import { z } from 'zod'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { reviewSchema } from '@/lib/validations'

export type ActionResult = { ok: true } | { ok: false; error: string }

const saveReviewSchema = reviewSchema.extend({
  animeId: z.number().int().positive(),
  animeTitle: z.string().trim().min(1).max(300),
})

/**
 * Server Action: create or update the signed-in user's review.
 * Validated again on the server, because the client can't be trusted.
 */
export async function saveReview(input: z.input<typeof saveReviewSchema>): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' }

  const parsed = saveReviewSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid review' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in to write a review.' }

  const { animeId, animeTitle, rating, body } = parsed.data
  const { error } = await supabase.from('reviews').upsert(
    {
      user_id: user.id,
      anime_id: animeId,
      anime_title: animeTitle,
      rating,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,anime_id' },
  )

  if (error) return { ok: false, error: 'Could not save your review. Please try again.' }
  return { ok: true }
}

export async function deleteReview(animeId: number): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' }
  if (!Number.isInteger(animeId) || animeId <= 0) return { ok: false, error: 'Invalid anime' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in first.' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('user_id', user.id)
    .eq('anime_id', animeId)

  if (error) return { ok: false, error: 'Could not delete your review.' }
  return { ok: true }
}
