import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Package } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { booksApi } from '@/services/api'
import type { Book, User } from '@/types'

interface BookCardProps {
  book: Book
  index: number
  user: User | null
  onBorrow?: () => void
}

export default function BookCard({ book, index, user, onBorrow }: BookCardProps) {
  const [loading, setLoading] = useState(false)

  const handleBorrow = async () => {
    if (!user) {
      alert('Please login first')
      return
    }

    if (book.available_quantity <= 0) {
      alert('No copies available')
      return
    }

    if (!confirm(`Borrow "${book.title}"?`)) return

    try {
      setLoading(true)
      const response = await booksApi.borrow(user.id, book.id)

      if (response.success) {
        alert('Book borrowed successfully!')
        onBorrow?.()
      } else {
        alert(response.message || 'Failed to borrow book')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/50 backdrop-blur-sm">
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground">{book.author || 'Unknown Author'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">
            {book.description || 'No description available'}
          </p>

          {/* Meta Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="outline">{book.category || 'Uncategorized'}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Publisher:</span>
              <span className="font-medium">{book.publisher || 'Unknown'}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" />
                Stock:
              </span>
              <span className={`font-medium ${book.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.available_quantity} / {book.total_quantity}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBorrow}
              disabled={loading || book.available_quantity <= 0}
              className="flex-1"
              size="sm"
            >
              {loading ? 'Borrowing...' : book.available_quantity > 0 ? 'Borrow' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
