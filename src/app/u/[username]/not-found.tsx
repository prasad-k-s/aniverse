import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProfileNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">User not found</h1>
      <p className="text-muted-foreground mt-2">There&apos;s no AniVerse user with that name.</p>
      <Button asChild className="mt-6">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
