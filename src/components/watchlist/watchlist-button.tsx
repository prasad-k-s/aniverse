'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useUser } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlistEntry } from '@/hooks/use-watchlist'
import type { MediaFormat } from '@/lib/anilist/types'
import { WATCH_STATUS_LABELS, WATCH_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export interface WatchlistButtonProps {
  animeId: number
  title: string
  coverImage: string | null
  episodes: number | null
  format: MediaFormat | null
  className?: string
}

export function WatchlistButton({
  animeId,
  title,
  coverImage,
  episodes,
  format,
  className,
}: WatchlistButtonProps) {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const { data: entry, isPending } = useWatchlistEntry(animeId)
  const add = useAddToWatchlist()
  const remove = useRemoveFromWatchlist()

  if (loading || (user && isPending)) return <Skeleton className={cn('h-10 w-full', className)} />

  if (!user) {
    return (
      <Button asChild size="lg" className={cn('w-full', className)}>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
          <PlusIcon /> Sign in to track
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant={entry ? 'secondary' : 'default'}
          className={cn('w-full justify-between', className)}
        >
          <span className="flex items-center gap-2">
            {entry ? <CheckIcon /> : <PlusIcon />}
            {entry ? WATCH_STATUS_LABELS[entry.status] : 'Add to list'}
          </span>
          <ChevronDownIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuLabel className="text-muted-foreground text-xs">Set status</DropdownMenuLabel>
        {WATCH_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onSelect={() =>
              add.mutate({ animeId, status: status.value, title, coverImage, episodes, format })
            }
          >
            <CheckIcon
              className={cn(entry?.status === status.value ? 'opacity-100' : 'opacity-0')}
            />
            {status.label}
          </DropdownMenuItem>
        ))}
        {entry && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => remove.mutate(animeId)}>
              <Trash2Icon /> Remove from list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
