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
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface Appointment {
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
  student?: {
    id: number
    username: string
    avatar_url: string | null
  }
  photographer?: {
    id: number
    username: string
    avatar_url: string | null
  }
}

interface PaginatedResponse {
  items: Appointment[]
  total: number
  page: number
  size: number
  pages: number
}

export default function AppointmentsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const appointmentsPerPage = 12

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看预约')
      router.push('/auth/login')
    } else if (isAuthenticated && user) {
      loadAppointments()
    }
  }, [authLoading, isAuthenticated, user, currentPage, filterStatus])

  const loadAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: appointmentsPerPage.toString(),
      })

      if (filterStatus !== 'all') {
        params.append('status_filter', filterStatus)
      }

      const response = await fetch(`/api/appointments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取预约列表失败')
      }

      const data: PaginatedResponse = await response.json()
      setAppointments(data.items)
      setTotalPages(data.pages)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
      setAppointments([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (appointmentId: number, action: string, data?: any) => {
    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      let url = `/api/appointments/${appointmentId}/actions?action=${action}`
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
      loadAppointments() // 重新加载列表
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />
      case 'cancelled':
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
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

  const canCancel = (appointment: Appointment) => {
    const appointmentTime = new Date(appointment.preferred_time)
    const now = new Date()
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return appointment.status === 'pending' && hoursUntilAppointment > 24
  }

  const canRate = (appointment: Appointment) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">我的预约</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">管理和查看您的摄影预约</p>
          </div>
          <Link
            href="/appointments/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新建预约
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => {
                  setFilterStatus(statusKey)
                  setCurrentPage(1)
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterStatus === statusKey
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {statusKey === 'all' ? '全部' : getStatusText(statusKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>加载预约失败: {error}</p>
              <button onClick={loadAppointments} className="mt-4 text-pink-600 hover:underline">
                重试
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4" />
              <p>您还没有任何预约。</p>
              <Link
                href="/appointments/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                新建预约
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {appointment.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{getStatusText(appointment.status)}</span>
                        </span>
                      </div>
                      
                      {appointment.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {appointment.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {new Date(appointment.preferred_time).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        
                        {appointment.location && (
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                        
                        {appointment.student && (
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4" />
                            <span>学生: {appointment.student.username}</span>
                          </div>
                        )}
                        
                        {appointment.photographer && (
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4" />
                            <span>摄影师: {appointment.photographer.username}</span>
                          </div>
                        )}
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>备注:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                      
                      {appointment.rating && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>评分:</strong> {appointment.rating}/5 星
                          </p>
                          {appointment.review && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                              <strong>评价:</strong> {appointment.review}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        查看详情
                      </Link>
                      
                      {user?.role === 'photographer' && appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(appointment.id, 'accept')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            接受
                          </button>
                          <button
                            onClick={() => handleAction(appointment.id, 'reject')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            拒绝
                          </button>
                        </>
                      )}
                      
                      {user?.role === 'photographer' && appointment.status === 'accepted' && (
                        <button
                          onClick={() => handleAction(appointment.id, 'complete')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          标记完成
                        </button>
                      )}
                      
                      {canCancel(appointment) && (
                        <button
                          onClick={() => handleAction(appointment.id, 'cancel')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                        >
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          取消
                        </button>
                      )}
                      
                      {canRate(appointment) && (
                        <button
                          onClick={() => {
                            const rating = prompt('请为此次服务评分 (1-5):')
                            if (rating && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
                              const review = prompt('请输入评价 (可选):')
                              handleAction(appointment.id, 'rate', { rating: parseInt(rating), review })
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                        >
                          <StarIcon className="w-4 h-4 mr-2" />
                          评价
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-8"
              aria-label="Pagination"
            >
              <div className="flex flex-1 justify-between sm:justify-end">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                  <ArrowLeftIcon className="h-5 w-5 ml-1 rotate-180" aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
