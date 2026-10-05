import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'

interface UserAvatarProps {
  name: string | null | undefined
  src: string | null | undefined
  className?: string
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('size-9', className)}>
      <AvatarImage src={src ?? undefined} alt="" />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
