'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ListIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/components/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useProfile } from '@/hooks/use-profile'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

export function UserNav() {
  const router = useRouter()
  const { user, loading } = useUser()
  const { data: profile } = useProfile()

  if (loading) return <Skeleton className="size-8 rounded-full" />

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  const name = profile?.display_name || profile?.username || user.email || 'Me'

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open account menu">
          <Avatar className="size-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{name}</p>
          {profile && <p className="text-muted-foreground truncate text-xs">@{profile.username}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile && (
          <DropdownMenuItem asChild>
            <Link href={`/u/${profile.username}`}>
              <UserIcon /> My profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/watchlist">
            <ListIcon /> My list
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          <LogOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
