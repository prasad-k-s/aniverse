'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SearchIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useRemoveFromWatchlist,
  useUpdateWatchlistEntry,
  useWatchlist,
} from '@/hooks/use-watchlist'
import { WATCH_STATUSES } from '@/lib/constants'
import type { WatchlistEntry, WatchStatus } from '@/lib/supabase/database.types'

/** The signed-in user's list, grouped by status, with inline editing. */
export function WatchlistBoard({ initialEntries }: { initialEntries: WatchlistEntry[] }) {
  const { data: entries = [] } = useWatchlist(initialEntries)

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-16 text-center">
        <p className="text-lg font-semibold">Your list is empty</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Find an anime you like and press &ldquo;Add to list&rdquo;.
        </p>
        <Button asChild className="mt-6">
          <Link href="/search">
            <SearchIcon /> Browse anime
          </Link>
        </Button>
      </div>
    )
  }

  const count = (status: WatchStatus) => entries.filter((entry) => entry.status === status).length

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All ({entries.length})</TabsTrigger>
        {WATCH_STATUSES.map((status) => (
          <TabsTrigger key={status.value} value={status.value}>
            {status.label} ({count(status.value)})
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all">
        <EntryList entries={entries} />
      </TabsContent>
      {WATCH_STATUSES.map((status) => (
        <TabsContent key={status.value} value={status.value}>
          <EntryList entries={entries.filter((entry) => entry.status === status.value)} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function EntryList({ entries }: { entries: WatchlistEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Nothing here yet.</p>
  }
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {entries.map((entry) => (
        <WatchlistRow key={entry.anime_id} entry={entry} />
      ))}
    </ul>
  )
}

export function WatchlistRow({ entry }: { entry: WatchlistEntry }) {
  const update = useUpdateWatchlistEntry()
  const remove = useRemoveFromWatchlist()

  return (
    <li className="bg-card flex gap-3 rounded-xl border p-3 sm:gap-4">
      <Link
        href={`/anime/${entry.anime_id}`}
        className="bg-muted relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md sm:w-20"
      >
        {entry.cover_image && (
          <Image src={entry.cover_image} alt="" fill sizes="80px" className="object-cover" />
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/anime/${entry.anime_id}`}
            className="hover:text-primary line-clamp-2 font-semibold"
          >
            {entry.title}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={`Remove ${entry.title} from list`}
            onClick={() => remove.mutate(entry.anime_id)}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <NativeSelect
            aria-label={`Status for ${entry.title}`}
            value={entry.status}
            onChange={(e) =>
              update.mutate({ animeId: entry.anime_id, status: e.target.value as WatchStatus })
            }
          >
            {WATCH_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            aria-label={`Your score for ${entry.title}`}
            value={entry.score ?? ''}
            onChange={(e) =>
              update.mutate({
                animeId: entry.anime_id,
                score: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="sm:w-28"
          >
            <option value="">No score</option>
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
              <option key={n} value={n}>
                {n} / 10
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
    </li>
  )
}
