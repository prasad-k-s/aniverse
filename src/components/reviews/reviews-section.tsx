'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { deleteReview, saveReview } from '@/app/anime/[id]/actions'
import { useUser } from '@/components/providers/auth-provider'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { ReviewWithAuthor } from '@/lib/supabase/database.types'
import { formatRelativeTime } from '@/lib/utils'
import type { ReviewValues } from '@/lib/validations'
import { ReviewForm } from './review-form'

async function fetchReviews(animeId: number): Promise<ReviewWithAuthor[]> {
  const { data, error } = await createClient()
    .from('reviews')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('anime_id', animeId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data as unknown as ReviewWithAuthor[]
}

export function ReviewsSection({ animeId, animeTitle }: { animeId: number; animeTitle: string }) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const [editing, setEditing] = useState(false)
  const queryKey = ['reviews', animeId]

  const {
    data: reviews = [],
    isPending,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchReviews(animeId),
    enabled: isSupabaseConfigured,
  })

  const myReview = user ? reviews.find((review) => review.user_id === user.id) : undefined
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null

  const handleSave = async (values: ReviewValues) => {
    const result = await saveReview({ animeId, animeTitle, ...values })
    if (!result.ok) return result.error
    setEditing(false)
    await queryClient.invalidateQueries({ queryKey })
    return null
  }

  const handleDelete = async () => {
    const result = await deleteReview(animeId)
    if (!result.ok) return toast.error(result.error)
    toast.success('Review deleted')
    await queryClient.invalidateQueries({ queryKey })
  }

  return (
    <section aria-labelledby="reviews-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="reviews-heading" className="text-xl font-bold">
          Reviews
        </h2>
        {average !== null && (
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <StarIcon className="fill-star text-star size-4" aria-hidden />
            <span className="text-foreground font-semibold">{average.toFixed(1)}</span> / 10 from{' '}
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>

      {!isSupabaseConfigured ? (
        <p className="text-muted-foreground text-sm">Reviews need Supabase to be configured.</p>
      ) : !user ? (
        <Card className="py-4">
          <CardContent className="text-sm">
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>{' '}
            to rate and review this anime.
          </CardContent>
        </Card>
      ) : (!myReview || editing) && !isPending ? (
        <Card className="py-5">
          <CardContent>
            <ReviewForm
              defaultValues={
                myReview ? { rating: myReview.rating, body: myReview.body } : undefined
              }
              onSave={handleSave}
              onCancel={editing ? () => setEditing(false) : undefined}
            />
          </CardContent>
        </Card>
      ) : null}

      {isPending && isSupabaseConfigured ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <p className="text-destructive text-sm">Couldn&apos;t load reviews.</p>
      ) : reviews.length === 0 && isSupabaseConfigured ? (
        <p className="text-muted-foreground text-sm">
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => {
            const name = review.profiles?.display_name || review.profiles?.username || 'Anonymous'
            const isMine = review.user_id === user?.id
            return (
              <li key={review.id} className="bg-card rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <UserAvatar name={name} src={review.profiles?.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {review.profiles ? (
                        <Link
                          href={`/u/${review.profiles.username}`}
                          className="font-semibold hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        <span className="font-semibold">{name}</span>
                      )}
                      <span className="bg-star/15 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold">
                        <StarIcon className="fill-star text-star size-3" aria-hidden />
                        {review.rating}/10
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(review.updated_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-line">{review.body}</p>
                    {isMine && !editing && (
                      <div className="mt-2 flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                          <PencilIcon /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDelete}>
                          <Trash2Icon /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
