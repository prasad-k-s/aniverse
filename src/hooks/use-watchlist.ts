'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/components/providers/auth-provider'
import type { WatchlistEntry } from '@/lib/supabase/database.types'
import type { WatchlistAddInput, WatchlistUpdateInput } from '@/lib/validations'
import { watchlistApi } from '@/lib/watchlist-api'

export const watchlistKeys = {
  all: ['me', 'watchlist'] as const,
  list: () => ['me', 'watchlist', 'list'] as const,
  entry: (animeId: number) => ['me', 'watchlist', 'entry', animeId] as const,
}

export function useWatchlist(initialData?: WatchlistEntry[]) {
  const { user } = useUser()
  return useQuery({
    queryKey: watchlistKeys.list(),
    queryFn: watchlistApi.getAll,
    enabled: Boolean(user),
    initialData,
  })
}

export function useWatchlistEntry(animeId: number) {
  const { user } = useUser()
  return useQuery({
    queryKey: watchlistKeys.entry(animeId),
    queryFn: () => watchlistApi.getOne(animeId),
    enabled: Boolean(user),
  })
}

type Snapshot = { list?: WatchlistEntry[]; entry?: WatchlistEntry | null }

/**
 * Optimistic updates: the UI changes immediately, and is rolled back with a toast
 * if the server rejects the change.
 */
function useOptimisticWatchlist() {
  const queryClient = useQueryClient()

  const snapshot = async (animeId: number): Promise<Snapshot> => {
    await queryClient.cancelQueries({ queryKey: watchlistKeys.all })
    return {
      list: queryClient.getQueryData<WatchlistEntry[]>(watchlistKeys.list()),
      entry: queryClient.getQueryData<WatchlistEntry | null>(watchlistKeys.entry(animeId)),
    }
  }

  const apply = (animeId: number, next: WatchlistEntry | null) => {
    queryClient.setQueryData<WatchlistEntry | null>(watchlistKeys.entry(animeId), next)
    queryClient.setQueryData<WatchlistEntry[]>(watchlistKeys.list(), (list) => {
      if (!list) return list
      const others = list.filter((item) => item.anime_id !== animeId)
      return next ? [next, ...others] : others
    })
  }

  const rollback = (animeId: number, previous: Snapshot | undefined) => {
    if (!previous) return
    queryClient.setQueryData(watchlistKeys.entry(animeId), previous.entry)
    queryClient.setQueryData(watchlistKeys.list(), previous.list)
  }

  const settle = () => queryClient.invalidateQueries({ queryKey: watchlistKeys.all })

  return { snapshot, apply, rollback, settle }
}

export function useAddToWatchlist() {
  const { user } = useUser()
  const optimistic = useOptimisticWatchlist()

  return useMutation({
    mutationFn: watchlistApi.add,
    onMutate: async (input: WatchlistAddInput) => {
      const previous = await optimistic.snapshot(input.animeId)
      optimistic.apply(input.animeId, {
        user_id: user?.id ?? '',
        anime_id: input.animeId,
        status: input.status,
        progress: previous.entry?.progress ?? 0,
        score: previous.entry?.score ?? null,
        title: input.title,
        cover_image: input.coverImage,
        episodes: input.episodes,
        format: input.format,
        updated_at: new Date().toISOString(),
      })
      return previous
    },
    onError: (error, input, previous) => {
      optimistic.rollback(input.animeId, previous)
      toast.error(error.message)
    },
    onSettled: optimistic.settle,
  })
}

export function useUpdateWatchlistEntry() {
  const optimistic = useOptimisticWatchlist()

  return useMutation({
    mutationFn: watchlistApi.update,
    onMutate: async (input: WatchlistUpdateInput) => {
      const previous = await optimistic.snapshot(input.animeId)
      const current =
        previous.entry ?? previous.list?.find((item) => item.anime_id === input.animeId)
      if (current) {
        optimistic.apply(input.animeId, {
          ...current,
          status: input.status ?? current.status,
          score: input.score === undefined ? current.score : input.score,
          updated_at: new Date().toISOString(),
        })
      }
      return previous
    },
    onError: (error, input, previous) => {
      optimistic.rollback(input.animeId, previous)
      toast.error(error.message)
    },
    onSettled: optimistic.settle,
  })
}

export function useRemoveFromWatchlist() {
  const optimistic = useOptimisticWatchlist()

  return useMutation({
    mutationFn: watchlistApi.remove,
    onMutate: async (animeId: number) => {
      const previous = await optimistic.snapshot(animeId)
      optimistic.apply(animeId, null)
      return previous
    },
    onError: (error, animeId, previous) => {
      optimistic.rollback(animeId, previous)
      toast.error(error.message)
    },
    onSettled: optimistic.settle,
  })
}
