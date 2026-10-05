import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold tracking-tight"
      aria-label="AniVerse home"
    >
      <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F43F8E" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#logo-gradient)" />
        <path
          d="M32 10c2 12 8 18 22 22-14 4-20 10-22 22-2-12-8-18-22-22 14-4 20-10 22-22z"
          fill="#fff"
        />
      </svg>
      <span className="text-lg">
        Ani<span className="text-primary">Verse</span>
      </span>
    </Link>
  )
}
