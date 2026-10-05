'use client'

import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { reviewSchema, type ReviewValues } from '@/lib/validations'
import { RatingInput } from './rating-input'

interface ReviewFormProps {
  defaultValues?: ReviewValues
  /** Saves the review; resolves with an error message or null on success */
  onSave: (values: ReviewValues) => Promise<string | null>
  onCancel?: () => void
}

export function ReviewForm({ defaultValues, onSave, onCancel }: ReviewFormProps) {
  const [isSaving, startSaving] = useTransition()
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: defaultValues ?? { rating: 0, body: '' },
  })

  const length = watch('body')?.length ?? 0

  const onSubmit = (values: ReviewValues) =>
    startSaving(async () => {
      const error = await onSave(values)
      if (error) toast.error(error)
      else toast.success(defaultValues ? 'Review updated' : 'Review posted')
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label asChild>
          <span>Your rating</span>
        </Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <RatingInput
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.rating)}
            />
          )}
        />
        {errors.rating && <p className="text-destructive text-sm">{errors.rating.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          rows={5}
          placeholder="What did you like? What didn't work for you? (no spoilers please)"
          aria-invalid={Boolean(errors.body)}
          aria-describedby="review-body-help"
          {...register('body')}
        />
        <div id="review-body-help" className="flex justify-between text-xs">
          <span className="text-destructive">{errors.body?.message}</span>
          <span className="text-muted-foreground">{length}/2000</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : defaultValues ? 'Update review' : 'Post review'}
        </Button>
      </div>
    </form>
  )
}
