'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { updateAvatarUrl } from '@/app/settings/actions'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024
export const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

/** Returns an error message, or null if the file can be used as an avatar. */
export function validateAvatar(file: File): string | null {
  if (!AVATAR_TYPES.includes(file.type)) return 'Please choose a PNG, JPG, WebP or GIF image.'
  if (file.size > MAX_AVATAR_BYTES) return 'Images must be 2 MB or smaller.'
  return null
}

interface AvatarUploadProps {
  userId: string
  name: string
  avatarUrl: string | null
}

/** Uploads straight from the browser to Supabase Storage (users can only write to their own folder). */
export function AvatarUpload({ userId, name, avatarUrl }: AvatarUploadProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(avatarUrl)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const problem = validateAvatar(file)
    if (problem) return toast.error(problem)

    setUploading(true)
    try {
      const supabase = createClient()
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const path = `${userId}/avatar-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const result = await updateAvatarUrl(data.publicUrl)
      if (!result.ok) throw new Error(result.error)

      setPreview(data.publicUrl)
      await queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
      router.refresh()
      toast.success('Avatar updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <UserAvatar name={name} src={preview} className="size-20 text-xl" />
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_TYPES.join(',')}
          className="sr-only"
          id="avatar-input"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon /> {uploading ? 'Uploading…' : 'Change avatar'}
        </Button>
        <p className="text-muted-foreground text-xs">PNG, JPG, WebP or GIF, up to 2 MB.</p>
      </div>
    </div>
  )
}
