import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { booksApi } from '@/services/api'
import StarRating from '@/components/StarRating'
import type { BorrowingRecord, User } from '@/types'

export default function Borrowings() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [records, setRecords] = useState<BorrowingRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    loadRecords(userData.id)
  }, [navigate])

  const loadRecords = async (userId: number) => {
    try {
      setLoading(true)
      const response = await booksApi.getMyBorrowings(userId)
      if (response.success) {
        setRecords(response.records)
      }
    } catch (error) {
      console.error('Failed to load records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (recordId: number) => {
    if (!confirm('Confirm return?')) return

    try {
      const response = await booksApi.return(recordId)
      if (response.success) {
        alert('Book returned successfully!')
        loadRecords(user!.id)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to return book')
    }
  }

  const handleRenew = async (recordId: number) => {
    if (!confirm('Renew for another 30 days?')) return

    try {
      const response = await booksApi.renew(recordId)
      if (response.success) {
        alert('Book renewed successfully!')
        loadRecords(user!.id)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to renew book')
    }
  }

  const handleRate = async (recordId: number, rating: number) => {
    try {
      const response = await booksApi.rateBook(recordId, rating)
      if (response.success) {
        alert('评分成功！')
        loadRecords(user!.id)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '评分失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Borrowings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No borrowing records</h3>
            <p className="text-muted-foreground">Start borrowing books to see your history here</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Browse Books
            </Button>
          </motion.div>
        ) : (
          <div className="bg-background/50 backdrop-blur-sm rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">Book</th>
                  <th className="text-left p-4">Author</th>
                  <th className="text-left p-4">Borrow Date</th>
                  <th className="text-left p-4">Due Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium">{record.title}</td>
                    <td className="p-4 text-muted-foreground">{record.author}</td>
                    <td className="p-4 text-sm">{new Date(record.borrow_date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">{new Date(record.due_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge variant={record.status === 'borrowed' ? 'default' : 'secondary'}>
                        {record.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {record.status === 'returned' && (
                        record.rating ? (
                          <StarRating rating={record.rating} readonly size="sm" />
                        ) : (
                          <StarRating onRate={(rating) => handleRate(record.id, rating)} size="sm" />
                        )
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {record.status === 'borrowed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenew(record.id)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Renew
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReturn(record.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Return
                          </Button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
