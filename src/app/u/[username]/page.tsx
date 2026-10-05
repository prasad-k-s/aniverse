import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StarIcon } from 'lucide-react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { WATCH_STATUS_LABELS, WATCH_STATUSES } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { USERNAME_REGEX } from '@/lib/validations'

type PageProps = { params: Promise<{ username: string }> }

async function getProfile(username: string) {
  if (!isSupabaseConfigured || !USERNAME_REGEX.test(username)) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfile(username)
  if (!profile) return { title: 'User not found' }
  const name = profile.display_name || profile.username
  return {
    title: `${name} (@${profile.username})`,
    description: profile.bio || `${name}'s anime list and reviews on AniVerse.`,
  }
}

/** Public profile: stats, the anime they're watching and their latest reviews. */
export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfile(username)
  if (!profile) notFound()

  const supabase = await createClient()
  const [{ data: entries }, { data: reviews }] = await Promise.all([
    supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const list = entries ?? []
  const name = profile.display_name || profile.username
  const completed = list.filter((entry) => entry.status === 'completed').length
  const scored = list.filter((entry) => entry.score !== null)
  const meanScore =
    scored.length > 0
      ? scored.reduce((sum, entry) => sum + (entry.score ?? 0), 0) / scored.length
      : null
  const joined = new Date(profile.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <UserAvatar name={name} src={profile.avatar_url} className="size-24 text-2xl" />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
          <p className="text-muted-foreground">
            @{profile.username} · Joined {joined}
          </p>
          {profile.bio && <p className="max-w-xl pt-1">{profile.bio}</p>}
        </div>
      </header>

      <section aria-label="Stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Anime', list.length],
          ['Completed', completed],
          ['Mean score', meanScore ? meanScore.toFixed(1) : '—'],
          ['Reviews', reviews?.length ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="bg-card rounded-xl border p-4 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="list-heading" className="space-y-4">
        <h2 id="list-heading" className="text-xl font-bold">
          Anime list
        </h2>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-sm">{name} hasn&apos;t added any anime yet.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-sm">
              {WATCH_STATUSES.map((status) => {
                const n = list.filter((entry) => entry.status === status.value).length
                return n > 0 ? (
                  <span key={status.value} className="rounded-full border px-3 py-1">
                    {status.label}: <strong>{n}</strong>
                  </span>
                ) : null
              })}
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {list.slice(0, 24).map((entry) => (
                <li key={entry.anime_id}>
                  <Link href={`/anime/${entry.anime_id}`} className="group block">
                    <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg">
                      {entry.cover_image && (
                        <Image
                          src={entry.cover_image}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 15vw, 30vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1 text-[11px] font-medium text-white">
                        {WATCH_STATUS_LABELS[entry.status]}
                      </span>
                    </div>
                    <p className="group-hover:text-primary mt-1 line-clamp-2 text-xs font-medium">
                      {entry.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="reviews-heading" className="space-y-4">
        <h2 id="reviews-heading" className="text-xl font-bold">
          Recent reviews
        </h2>
        {!reviews || reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="bg-card rounded-xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/anime/${review.anime_id}`}
                    className="hover:text-primary font-semibold"
                  >
                    {review.anime_title}
                  </Link>
                  <span className="bg-star/15 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold">
                    <StarIcon className="fill-star text-star size-3" aria-hidden />
                    {review.rating}/10
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 line-clamp-4 text-sm whitespace-pre-line">
                  {review.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
