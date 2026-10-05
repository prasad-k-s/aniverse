import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-primary text-6xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page went to another isekai</h1>
      <p className="text-muted-foreground mt-2">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Browse anime</Link>
        </Button>
      </div>
    </div>
  )
}
