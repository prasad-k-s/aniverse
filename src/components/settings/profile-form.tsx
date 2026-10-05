'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateProfile } from '@/app/settings/actions'
import { FormField } from '@/components/auth/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { profileSchema, type ProfileValues } from '@/lib/validations'

export function ProfileForm({ defaultValues }: { defaultValues: ProfileValues }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues })

  const bioLength = watch('bio')?.length ?? 0

  const onSubmit = async (values: ProfileValues) => {
    const result = await updateProfile(values)
    if (!result.ok) {
      if (result.field) setError(result.field, { message: result.error })
      else toast.error(result.error)
      return
    }
    reset(values)
    await queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
    toast.success('Profile saved')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        id="username"
        label="Username"
        error={errors.username?.message}
        hint="Your profile lives at /u/username"
      >
        <Input id="username" aria-invalid={Boolean(errors.username)} {...register('username')} />
      </FormField>
      <FormField id="displayName" label="Display name" error={errors.displayName?.message}>
        <Input
          id="displayName"
          aria-invalid={Boolean(errors.displayName)}
          {...register('displayName')}
        />
      </FormField>
      <FormField id="bio" label="Bio" error={errors.bio?.message} hint={`${bioLength}/200`}>
        <Textarea
          id="bio"
          rows={3}
          placeholder="Your favourite genres, all-time top 3…"
          aria-invalid={Boolean(errors.bio)}
          {...register('bio')}
        />
      </FormField>
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
