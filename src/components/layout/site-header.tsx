'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from './theme-toggle'
import { UserNav } from './user-nav'

const NAV_LINKS = [
  { href: '/', label: 'Discover' },
  { href: '/search', label: 'Browse' },
  { href: '/watchlist', label: 'My list' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <MobileNav links={NAV_LINKS} isActive={isActive} />

        <Logo />

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(link.href) && 'bg-accent text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Search anime">
            <Link href="/search">
              <SearchIcon />
            </Link>
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
