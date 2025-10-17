import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { booksApi } from '@/services/api'
import type { User } from '@/types'

interface Feedback {
  id: number
  user_id: number
  type: string
  content: string
  status: string
  admin_reply: string | null
  created_at: string
}

export default function Feedback() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'suggestion',
    content: '',
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    loadFeedbacks(userData.id)
  }, [navigate])

  const loadFeedbacks = async (userId: number) => {
    try {
      setLoading(true)
      const response = await booksApi.getMyFeedbacks(userId)
      if (response.success) {
        setFeedbacks(response.feedbacks)
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.content.trim()) return

    try {
      setSubmitting(true)
      const response = await booksApi.submitFeedback({
        user_id: user.id,
        type: formData.type,
        content: formData.content,
      })

      if (response.success) {
        alert('反馈提交成功！')
        setFormData({ type: 'suggestion', content: '' })
        loadFeedbacks(user.id)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      suggestion: '建议',
      complaint: '投诉',
      request: '请求',
    }
    return types[type] || type
  }

  const getStatusBadge = (status: string) => {
    if (status === 'replied') {
      return <Badge className="bg-green-500">已回复</Badge>
    } else if (status === 'pending') {
      return <Badge variant="secondary">处理中</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">意见反馈</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 提交反馈表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>提交新反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">反馈类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="suggestion">建议</option>
                    <option value="complaint">投诉</option>
                    <option value="request">图书请求</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">反馈内容</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="请详细描述您的意见或建议..."
                    className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background resize-none"
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? '提交中...' : '提交反馈'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* 我的反馈记录 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-4">我的反馈记录</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">还没有反馈记录</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{getTypeLabel(feedback.type)}</Badge>
                          {getStatusBadge(feedback.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">我的反馈：</p>
                        <p className="text-sm">{feedback.content}</p>
                      </div>

                      {feedback.admin_reply && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-sm font-medium">管理员回复：</p>
                          </div>
                          <p className="text-sm">{feedback.admin_reply}</p>
                        </div>
                      )}

                      {!feedback.admin_reply && feedback.status === 'pending' && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">等待管理员处理中...</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
