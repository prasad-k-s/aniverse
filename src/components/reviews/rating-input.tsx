'use client'

import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  value: number
  onChange: (value: number) => void
  invalid?: boolean
}

/** 1-10 rating picker made of real radio buttons, so it works with the keyboard and screen readers. */
export function RatingInput({ value, onChange, invalid }: RatingInputProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Rating out of 10"
      aria-invalid={invalid || undefined}
      className="flex flex-wrap gap-1"
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const selected = n <= value
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} out of 10`}
            onClick={() => onChange(n)}
            className={cn(
              'flex size-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors',
              selected
                ? 'border-star/60 bg-star/15 text-foreground'
                : 'text-muted-foreground hover:bg-accent',
            )}
          >
            {n === value ? <StarIcon className="fill-star text-star size-4" aria-hidden /> : n}
          </button>
        )
      })}
    </div>
  )
}
