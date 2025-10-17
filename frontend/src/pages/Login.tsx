import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/services/api'

export default function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authApi.login({
          username: formData.username,
          password: formData.password,
        })

        if (response.success && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
          navigate('/dashboard')
        } else {
          setError(response.message || 'Login failed')
        }
      } else {
        const response = await authApi.register(formData)

        if (response.success) {
          setError('')
          alert('Registration successful! Please login.')
          setIsLogin(true)
        } else {
          setError(response.message || 'Registration failed')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-800 to-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-slate-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">智慧图书馆</CardTitle>
            <CardDescription>E-Librarian - 无人值守图书馆</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter username"
                    className="pl-10"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="Enter phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Default admin account:</p>
              <p className="font-mono">admin / admin123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
