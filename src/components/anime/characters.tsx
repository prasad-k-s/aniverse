import Image from 'next/image'
import type { AnimeDetail } from '@/lib/anilist/types'

export function Characters({ characters }: { characters: AnimeDetail['characters']['edges'] }) {
  if (characters.length === 0) return null

  return (
    <section aria-labelledby="characters-heading">
      <h2 id="characters-heading" className="mb-4 text-xl font-bold">
        Characters
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map(({ node, role }) => (
          <li key={node.id} className="bg-card flex items-center gap-3 rounded-lg border p-2">
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">
              {node.image.large && (
                <Image src={node.image.large} alt="" fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{node.name.full}</p>
              <p className="text-muted-foreground text-xs capitalize">{role.toLowerCase()}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
