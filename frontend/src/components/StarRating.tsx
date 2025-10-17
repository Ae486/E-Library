import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating?: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ rating = 0, onRate, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readonly && setHoverRating(value)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              value <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {rating > 0 && readonly && (
        <span className="text-sm text-muted-foreground ml-2">
          {rating}.0
        </span>
      )}
    </div>
  )
}
