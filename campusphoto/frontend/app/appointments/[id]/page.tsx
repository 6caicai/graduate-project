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
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  StarIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface AppointmentDetail {
  id: number
  title: string
  description: string | null
  preferred_time: string
  actual_time: string | null
  location: string | null
  status: string
  notes: string | null
  rating: number | null
  review: string | null
  created_at: string
  updated_at: string | null
  student_id: number
  photographer_id: number
  student: {
    id: number
    username: string
    email: string
    avatar_url: string | null
    bio: string | null
  }
  photographer: {
    id: number
    username: string
    email: string
    avatar_url: string | null
    bio: string | null
  }
}

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看预约详情')
      router.push('/auth/login')
    } else if (isAuthenticated && user) {
      loadAppointmentDetail()
    }
  }, [authLoading, isAuthenticated, user, params.id])

  const loadAppointmentDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch(`/api/appointments/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取预约详情失败')
      }

      const data = await response.json()
      setAppointment(data)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, data?: any) => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      let url = `/api/appointments/${params.id}/actions?action=${action}`
      if (action === 'rate' && data) {
        url += `&rating=${data.rating}`
        if (data.review) {
          url += `&review=${encodeURIComponent(data.review)}`
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: data && action !== 'rate' ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '操作失败')
      }

      toast.success('操作成功')
      loadAppointmentDetail() // 重新加载详情
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />
      case 'accepted':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-blue-500" />
      case 'cancelled':
        return <ExclamationTriangleIcon className="w-6 h-6 text-gray-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理'
      case 'accepted':
        return '已接受'
      case 'rejected':
        return '已拒绝'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return '未知状态'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const canCancel = (appointment: AppointmentDetail) => {
    const appointmentTime = new Date(appointment.preferred_time)
    const now = new Date()
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return appointment.status === 'pending' && hoursUntilAppointment > 24
  }

  const canRate = (appointment: AppointmentDetail) => {
    return appointment.status === 'completed' && !appointment.rating && user?.id === appointment.student_id
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">加载预约详情...</span>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">预约不存在</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || '您要查看的预约不存在或已被删除'}
            </p>
            <Link
              href="/appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              返回预约列表
            </Link>
          </div>
        </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {appointment.title}
              </h1>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-2">{getStatusText(appointment.status)}</span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  创建时间: {new Date(appointment.created_at).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 预约信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">预约信息</h2>
              
              {appointment.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</h3>
                  <p className="text-gray-600 dark:text-gray-400">{appointment.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">预约时间</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(appointment.preferred_time).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                {appointment.actual_time && (
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">实际时间</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(appointment.actual_time).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                )}

                {appointment.location && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">拍摄地点</p>
                      <p className="text-gray-600 dark:text-gray-400">{appointment.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {appointment.notes && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">备注</h3>
                  <p className="text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                </div>
              )}

              {appointment.rating && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">评价</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-600 dark:text-blue-400">评分:</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < appointment.rating! 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-blue-600 dark:text-blue-400">({appointment.rating}/5)</span>
                  </div>
                  {appointment.review && (
                    <p className="text-blue-600 dark:text-blue-400">{appointment.review}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 用户信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">用户信息</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学生</h3>
                  <div className="flex items-center space-x-3">
                    {appointment.student.avatar_url ? (
                      <img
                        src={appointment.student.avatar_url}
                        alt={appointment.student.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.student.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {appointment.student.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">摄影师</h3>
                  <div className="flex items-center space-x-3">
                    {appointment.photographer.avatar_url ? (
                      <img
                        src={appointment.photographer.avatar_url}
                        alt={appointment.photographer.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.photographer.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {appointment.photographer.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">操作</h2>
              
              <div className="space-y-3">
                {user?.role === 'photographer' && appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction('accept')}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      接受预约
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      拒绝预约
                    </button>
                  </>
                )}

                {user?.role === 'photographer' && appointment.status === 'accepted' && (
                  <button
                    onClick={() => handleAction('complete')}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    标记完成
                  </button>
                )}

                {canCancel(appointment) && (
                  <button
                    onClick={() => handleAction('cancel')}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    取消预约
                  </button>
                )}

                {canRate(appointment) && (
                  <button
                    onClick={() => {
                      const rating = prompt('请为此次服务评分 (1-5):')
                      if (rating && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
                        const review = prompt('请输入评价 (可选):')
                        handleAction('rate', { rating: parseInt(rating), review })
                      }
                    }}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <StarIcon className="w-4 h-4 mr-2" />
                    评价服务
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
