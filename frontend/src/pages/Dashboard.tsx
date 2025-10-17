import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, LogOut, User as UserIcon, LayoutDashboard, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { booksApi } from '@/services/api'
import type { Book, User } from '@/types'
import BookCard from '@/components/BookCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'books' | 'borrowings' | 'admin'>('books')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(userStr))
    loadBooks()
  }, [navigate])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const response = await booksApi.list()
      if (response.success) {
        setBooks(response.books)
      }
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBooks()
      return
    }

    try {
      const response = await booksApi.search(searchQuery)
      if (response.success) {
        setBooks(response.books)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const filteredBooks = books

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">智慧图书馆</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium">{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    Admin
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/feedback')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                反馈
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <UserIcon className="w-4 h-4 mr-2" />
                个人资料
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === 'books'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Browse Books</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('borrowings')
                navigate('/borrowings')
              }}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === 'borrowings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Borrowings</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin')
                  navigate('/admin')
                }}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === 'admin'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Discover Books</h2>
          <p className="text-muted-foreground">
            Browse our collection and find your next great read
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
          <Button variant="outline" onClick={loadBooks}>
            Show All
          </Button>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading books...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} user={user} onBorrow={loadBooks} />
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
