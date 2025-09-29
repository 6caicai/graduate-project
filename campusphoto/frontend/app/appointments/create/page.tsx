'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ArrowLeftIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

interface Photographer {
  id: number
  username: string
  email: string
  bio: string | null
  avatar_url: string | null
  role: string
}

export default function CreateAppointmentPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    photographer_id: '',
    title: '',
    description: '',
    preferred_time: '',
    location: ''
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以创建预约')
      router.push('/auth/login')
    } else if (isAuthenticated && user) {
      loadPhotographers()
    }
  }, [authLoading, isAuthenticated, user])

  const loadPhotographers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch('/api/users?role=photographer', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取摄影师列表失败')
      }

      const data = await response.json()
      setPhotographers(data.items || [])
    } catch (err: any) {
      toast.error(err.message)
      console.error('加载摄影师失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.photographer_id) {
      toast.error('请选择摄影师')
      return
    }
    
    if (!formData.title.trim()) {
      toast.error('请输入预约标题')
      return
    }
    
    if (!formData.preferred_time) {
      toast.error('请选择预约时间')
      return
    }
    
    // 验证时间是否在未来
    const selectedTime = new Date(formData.preferred_time)
    const now = new Date()
    if (selectedTime <= now) {
      toast.error('预约时间必须在未来')
      return
    }
    
    // 验证时间是否在合理范围内（不超过30天）
    const maxAdvanceDays = 30
    const maxTime = new Date(now.getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000)
    if (selectedTime > maxTime) {
      toast.error(`预约时间不能超过${maxAdvanceDays}天`)
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photographer_id: parseInt(formData.photographer_id),
          title: formData.title,
          description: formData.description || null,
          preferred_time: formData.preferred_time,
          location: formData.location || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建预约失败')
      }

      toast.success('预约创建成功！')
      router.push('/appointments')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/appointments"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            返回预约列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">新建预约</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">预约专业摄影师为您服务</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 摄影师选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  选择摄影师 *
                </label>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">加载摄影师列表...</span>
                  </div>
                ) : photographers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">暂无可用的摄影师</p>
                ) : (
                  <select
                    name="photographer_id"
                    value={formData.photographer_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">请选择摄影师</option>
                    {photographers.map((photographer) => (
                      <option key={photographer.id} value={photographer.id}>
                        {photographer.username} - {photographer.bio || '专业摄影师'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 预约标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  预约标题 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="例如：毕业照拍摄、个人写真等"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* 预约描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  预约描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="请详细描述您的拍摄需求..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* 预约时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  预约时间 *
                </label>
                <input
                  type="datetime-local"
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  预约时间必须在未来，且不超过30天
                </p>
              </div>

              {/* 拍摄地点 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  拍摄地点
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="例如：校园图书馆前、操场、教学楼等"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/appointments"
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? '创建中...' : '创建预约'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
