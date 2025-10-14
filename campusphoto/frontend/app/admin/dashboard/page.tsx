'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  UserIcon,
  PhotoIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  HeartIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  total_users: number
  total_photos: number
  total_appointments: number
  pending_photos: number
  approved_photos: number
  rejected_photos: number
  recent_photos: any[]
  recent_users: any[]
  system_health: {
    status: string
    uptime: string
    memory_usage: number
    disk_usage: number
    cpu_usage?: number
  }
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/auth/login')
    } else if (isAuthenticated && user?.role !== 'admin') {
      toast.error('无权限访问此页面')
      router.push('/')
    } else if (isAuthenticated && user?.role === 'admin') {
      loadDashboardStats()
    }
  }, [authLoading, isAuthenticated, user])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch('http://localhost:8000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取仪表板数据失败')
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error('加载仪表板数据失败:', err)
      toast.error(err.message)
      // 设置默认数据
      setStats({
        total_users: 0,
        total_photos: 0,
        total_appointments: 0,
        pending_photos: 0,
        approved_photos: 0,
        rejected_photos: 0,
        recent_photos: [],
        recent_users: [],
        system_health: {
          status: 'healthy',
          uptime: '24h',
          memory_usage: 45.2,
          disk_usage: 32.1,
          cpu_usage: 15.8
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">加载仪表板...</span>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">管理仪表板</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">系统概览和管理中心</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总用户数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总照片数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_photos || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总预约数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_appointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">待审核照片</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pending_photos || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">照片审核状态</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">已通过</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.approved_photos || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">待审核</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.pending_photos || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">已拒绝</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.rejected_photos || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">系统健康状态</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">状态</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats?.system_health?.status === 'healthy' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : stats?.system_health?.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {stats?.system_health?.status === 'healthy' ? '正常' : 
                   stats?.system_health?.status === 'warning' ? '警告' : 
                   stats?.system_health?.status === 'unknown' ? '未知' : '异常'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">运行时间</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.system_health?.uptime || '0h'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">内存使用</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.system_health?.memory_usage || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">磁盘使用</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.system_health?.disk_usage || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">CPU使用</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.system_health?.cpu_usage || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速操作</h3>
            <div className="space-y-3">
              <Link
                href="/admin/photos"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <PhotoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">照片管理</span>
              </Link>
              <Link
                href="/admin/approval"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">照片审核</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">用户管理</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">系统设置</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近上传的照片</h3>
            {stats?.recent_photos && stats.recent_photos.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_photos.slice(0, 5).map((photo: any) => (
                  <div key={photo.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <img
                      src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                      alt={photo.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{photo.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">by {photo.user?.username}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      photo.approval_status === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : photo.approval_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {photo.approval_status === 'approved' ? '已通过' : photo.approval_status === 'pending' ? '待审核' : '已拒绝'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">暂无最近上传的照片</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近注册的用户</h3>
            {stats?.recent_users && stats.recent_users.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_users.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : user.role === 'photographer'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {user.role === 'admin' ? '管理员' : user.role === 'photographer' ? '摄影师' : '学生'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">暂无最近注册的用户</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
