'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CompassIcon, ListIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

const ICONS = {
  '/': CompassIcon,
  '/search': SearchIcon,
  '/watchlist': ListIcon,
} as const

interface MobileNavProps {
  links: { href: string; label: string }[]
  isActive: (href: string) => boolean
}

/**
 * Slide-in drawer for phones. It's portalled to <body> because the header's
 * backdrop-blur creates a containing block that would trap `position: fixed`.
 */
export function MobileNav({ links, isActive }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  // Close whenever the route changes
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    // Close if the screen grows past the md breakpoint while open
    const media = window.matchMedia('(min-width: 768px)')
    const onResize = () => media.matches && setOpen(false)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    media.addEventListener('change', onResize)
    closeRef.current?.focus()

    const trigger = triggerRef.current
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      media.removeEventListener('change', onResize)
      trigger?.focus()
    }
  }, [open])

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </Button>

      {mounted &&
        createPortal(
          <div className="md:hidden" inert={!open}>
            {/* Backdrop */}
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
                open ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            />

            {/* Drawer */}
            <aside
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
              className={cn(
                'bg-background fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r shadow-2xl',
                'transition-transform duration-300 ease-out motion-reduce:transition-none',
                open ? 'translate-x-0' : '-translate-x-full',
              )}
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Logo />
                <Button
                  ref={closeRef}
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <XIcon />
                </Button>
              </div>

              <nav aria-label="Main" className="flex flex-col gap-1 p-3">
                {links.map((link) => {
                  const Icon = ICONS[link.href as keyof typeof ICONS] ?? CompassIcon
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors',
                        active && 'bg-accent text-primary font-semibold',
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </div>,
          document.body,
        )}
    </>
  )
}
