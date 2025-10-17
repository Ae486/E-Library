import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Plus, Trash2, Users, Library, TrendingUp, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminApi, booksApi } from '@/services/api'
import type { Book, User, Statistics } from '@/types'

interface Feedback {
  id: number
  user_id: number
  username: string
  type: string
  content: string
  status: string
  admin_reply: string | null
  created_at: string
}

export default function Admin() {
  const navigate = useNavigate()
  const [, setUser] = useState<User | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<Statistics>({
    total_users: 0,
    total_books: 0,
    total_borrowings: 0,
    current_borrowings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [replyingId, setReplyingId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    total_quantity: 1,
    description: '',
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(userStr)
    if (userData.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    setUser(userData)
    loadData()
    loadFeedbacks()
  }, [navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [booksRes, userStatsRes, borrowingStatsRes] = await Promise.all([
        booksApi.list(),
        adminApi.getUserStatistics(),
        adminApi.getBorrowingStatistics(),
      ])

      if (booksRes.success) setBooks(booksRes.books)

      const combinedStats = {
        total_users: userStatsRes.total_users || 0,
        total_books: booksRes.books?.length || 0,
        total_borrowings: borrowingStatsRes.total_borrowings || 0,
        current_borrowings: borrowingStatsRes.current_borrowings || 0,
        popular_books: borrowingStatsRes.popular_books,
      }
      setStats(combinedStats)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await adminApi.addBook(newBook)
      if (response.success) {
        alert('Book added successfully!')
        setNewBook({
          title: '',
          author: '',
          isbn: '',
          category: '',
          publisher: '',
          total_quantity: 1,
          description: '',
        })
        loadData()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add book')
    }
  }

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const response = await adminApi.deleteBook(id)
      if (response.success) {
        alert('Book deleted successfully!')
        loadData()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete book')
    }
  }

  const loadFeedbacks = async () => {
    try {
      setFeedbackLoading(true)
      const response = await adminApi.getFeedbacks()
      if (response.success) {
        setFeedbacks(response.feedbacks)
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleReplyFeedback = async (feedbackId: number) => {
    if (!replyText.trim()) {
      alert('请输入回复内容')
      return
    }

    try {
      const response = await adminApi.replyFeedback(feedbackId, replyText)
      if (response.success) {
        alert('回复成功！')
        setReplyingId(null)
        setReplyText('')
        loadFeedbacks()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '回复失败')
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      suggestion: '建议',
      complaint: '投诉',
      request: '图书请求',
    }
    return types[type] || type
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
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <Library className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_books}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Borrowings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_borrowings}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Borrowings</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.current_borrowings}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Add New Book Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Title *"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                required
              />
              <Input
                placeholder="Author *"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                required
              />
              <Input
                placeholder="ISBN"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={newBook.category}
                onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
              />
              <Input
                placeholder="Publisher"
                value={newBook.publisher}
                onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newBook.total_quantity}
                onChange={(e) => setNewBook({ ...newBook, total_quantity: parseInt(e.target.value) })}
                min="1"
              />
              <div className="md:col-span-2">
                <Input
                  placeholder="Description"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="md:col-span-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All Books</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Author</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-center p-2">Stock</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">{book.title}</td>
                        <td className="p-2">{book.author}</td>
                        <td className="p-2">{book.category || '-'}</td>
                        <td className="p-2 text-center">{book.available_quantity} / {book.total_quantity}</td>
                        <td className="p-2 text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              用户反馈管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackLoading ? (
              <div className="text-center py-8">Loading feedbacks...</div>
            ) : feedbacks.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">暂无反馈</p>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id} className="border">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{feedback.username}</span>
                              <Badge variant={feedback.type === 'complaint' ? 'destructive' : 'default'}>
                                {getTypeLabel(feedback.type)}
                              </Badge>
                              <Badge variant={feedback.status === 'replied' ? 'default' : 'secondary'}>
                                {feedback.status === 'replied' ? '已回复' : '待处理'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(feedback.created_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-md">
                          <p className="text-sm">{feedback.content}</p>
                        </div>

                        {feedback.admin_reply && (
                          <div className="p-3 bg-primary/5 border-l-4 border-primary rounded-md">
                            <p className="text-sm font-medium mb-1">管理员回复：</p>
                            <p className="text-sm">{feedback.admin_reply}</p>
                          </div>
                        )}

                        {feedback.status === 'pending' && (
                          replyingId === feedback.id ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                placeholder="请输入回复内容..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReplyFeedback(feedback.id)}
                                >
                                  <Send className="w-3 h-3 mr-2" />
                                  发送回复
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingId(null)
                                    setReplyText('')
                                  }}
                                >
                                  取消
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingId(feedback.id)}
                            >
                              <MessageSquare className="w-3 h-3 mr-2" />
                              回复
                            </Button>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
