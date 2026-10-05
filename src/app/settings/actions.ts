'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, type ProfileValues } from '@/lib/validations'

export type ProfileActionResult =
  { ok: true; username: string } | { ok: false; error: string; field?: keyof ProfileValues }

/** Server Action: update the signed-in user's profile. */
export async function updateProfile(input: ProfileValues): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: issue?.message ?? 'Invalid profile',
      field: issue?.path[0] as keyof ProfileValues,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const { username, displayName, bio } = parsed.data
  const { error } = await supabase
    .from('profiles')
    .update({ username, display_name: displayName || null, bio: bio || null })
    .eq('id', user.id)

  if (error) {
    // 23505 = unique_violation in Postgres
    if (error.code === '23505')
      return { ok: false, error: 'That username is taken', field: 'username' }
    return { ok: false, error: 'Could not save your profile. Please try again.' }
  }

  revalidatePath(`/u/${username}`)
  return { ok: true, username }
}

const avatarUrlSchema = z.string().url().max(500)

/** Saves the public URL of an avatar the browser already uploaded to Supabase Storage. */
export async function updateAvatarUrl(url: string): Promise<{ ok: boolean; error?: string }> {
  const parsed = avatarUrlSchema.safeParse(url)
  if (!parsed.success) return { ok: false, error: 'Invalid image URL' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: parsed.data })
    .eq('id', user.id)
  if (error) return { ok: false, error: 'Could not update your avatar.' }
  return { ok: true }
}
