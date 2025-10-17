import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User as UserIcon, Mail, Phone, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/services/api'
import type { User } from '@/types'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    special_reader_type: '',
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    setFormData({
      email: userData.email || '',
      phone: userData.phone || '',
      special_reader_type: userData.special_reader_type || '',
    })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      const response = await authApi.updateProfile(user.id, {
        email: formData.email,
        phone: formData.phone,
        special_reader_type: formData.special_reader_type || null,
      })

      if (response.success) {
        // 更新本地存储
        const updatedUser = {
          ...user,
          email: formData.email,
          phone: formData.phone,
          special_reader_type: formData.special_reader_type || null,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        alert('个人信息更新成功！')
      } else {
        alert(response.message || '更新失败')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '更新失败')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold">个人资料</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>编辑个人信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 用户名（只读） */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>用户名</span>
                  </label>
                  <Input
                    value={user?.username || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">用户名不可修改</p>
                </div>

                {/* 角色（只读） */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">角色</label>
                  <Input
                    value={user?.role === 'admin' ? '管理员' : '普通用户'}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* 邮箱 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>邮箱</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* 手机号 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>手机号</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="请输入手机号码"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* 特殊读者类型 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">特殊读者类型（可选）</label>
                  <select
                    value={formData.special_reader_type}
                    onChange={(e) => setFormData({ ...formData, special_reader_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">普通读者</option>
                    <option value="elderly">老年读者</option>
                    <option value="foreign">外语读者</option>
                    <option value="disabled">残障读者</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    选择特殊读者类型可以获得个性化的界面支持
                  </p>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? '保存中...' : '保存更改'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    取消
                  </Button>
                </div>
              </form>

              {/* 账户创建时间 */}
              {user?.created_at && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    账户创建时间: {new Date(user.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
