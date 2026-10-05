'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RadioIcon, SendIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/components/providers/auth-provider'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { CommentWithAuthor } from '@/lib/supabase/database.types'
import { formatRelativeTime } from '@/lib/utils'
import { commentSchema, type CommentValues } from '@/lib/validations'

const COMMENT_LIMIT = 50

async function fetchComments(animeId: number): Promise<CommentWithAuthor[]> {
  const { data, error } = await createClient()
    .from('comments')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('anime_id', animeId)
    .order('created_at', { ascending: false })
    .limit(COMMENT_LIMIT)
  if (error) throw error
  return data as unknown as CommentWithAuthor[]
}

/** Live discussion: new comments from anyone appear instantly via Supabase Realtime. */
export function CommentsSection({ animeId }: { animeId: number }) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const queryKey = ['comments', animeId]

  const {
    data: comments = [],
    isPending,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchComments(animeId),
    enabled: isSupabaseConfigured,
  })

  // Subscribe to inserts/deletes on this anime's comments and refresh the list
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = createClient()
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['comments', animeId] })
    const channel = supabase
      .channel(`comments-${animeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `anime_id=eq.${animeId}` },
        refresh,
      )
      // Delete events can't be filtered by column, so refresh on any delete
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, refresh)
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [animeId, queryClient])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentValues>({ resolver: zodResolver(commentSchema), defaultValues: { body: '' } })

  const post = useMutation({
    mutationFn: async ({ body }: CommentValues) => {
      const { error } = await createClient()
        .from('comments')
        .insert({ user_id: user!.id, anime_id: animeId, body })
      if (error) throw error
    },
    onSuccess: () => {
      reset()
      return queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error('Could not post your comment.'),
  })

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await createClient().from('comments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast.error('Could not delete the comment.'),
  })

  return (
    <section aria-labelledby="comments-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 id="comments-heading" className="text-xl font-bold">
          Discussion
        </h2>
        {isSupabaseConfigured && (
          <span className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
            <RadioIcon className="size-3" aria-hidden /> Live
          </span>
        )}
      </div>

      {!isSupabaseConfigured ? (
        <p className="text-muted-foreground text-sm">Comments need Supabase to be configured.</p>
      ) : user ? (
        <form
          onSubmit={handleSubmit((values) => post.mutate(values))}
          className="flex flex-col gap-2 sm:flex-row sm:items-start"
          noValidate
        >
          <div className="flex-1">
            <Textarea
              rows={2}
              placeholder="Share a thought about this anime…"
              aria-label="Write a comment"
              aria-invalid={Boolean(errors.body)}
              {...register('body')}
            />
            {errors.body && <p className="text-destructive mt-1 text-sm">{errors.body.message}</p>}
          </div>
          <Button type="submit" disabled={post.isPending} className="sm:mt-0.5">
            <SendIcon /> Post
          </Button>
        </form>
      ) : (
        <p className="text-sm">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      {isPending && isSupabaseConfigured ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <p className="text-destructive text-sm">Couldn&apos;t load comments.</p>
      ) : comments.length === 0 && isSupabaseConfigured ? (
        <p className="text-muted-foreground text-sm">No comments yet. Start the conversation!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const name = comment.profiles?.display_name || comment.profiles?.username || 'Anonymous'
            return (
              <li key={comment.id} className="flex gap-3">
                <UserAvatar name={name} src={comment.profiles?.avatar_url} className="size-8" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    {comment.profiles ? (
                      <Link
                        href={`/u/${comment.profiles.username}`}
                        className="font-semibold hover:underline"
                      >
                        {name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{name}</span>
                    )}
                    <time dateTime={comment.created_at} className="text-muted-foreground text-xs">
                      {formatRelativeTime(comment.created_at)}
                    </time>
                    {comment.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto size-7"
                        aria-label="Delete comment"
                        onClick={() => remove.mutate(comment.id)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm break-words whitespace-pre-line">{comment.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
