'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { TokenManager } from '@/lib/api'
import {
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  EyeIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'

interface Photo {
  id: number
  title: string
  description: string | null
  user_id: number
  image_url: string
  thumbnail_url: string | null
  theme: string | null
  confidence: string | null
  views: number
  likes: number
  favorites: number
  votes: number
  heat_score: string | null
  competition_id: number | null
  is_approved: boolean
  approval_status: string
  approval_notes: string | null
  approved_by: number | null
  approved_at: string | null
  uploaded_at: string
  updated_at: string | null
  user?: {
    id: number
    username: string
    avatar_url: string | null
    role: string
  }
}

interface PaginatedResponse {
  items: Photo[]
  total: number
  page: number
  size: number
  pages: number
}

interface ApprovalStats {
  total_pending: number
  total_approved: number
  total_rejected: number
  today_approved: number
  today_rejected: number
  approval_rate: number
}

interface ApprovalFormData {
  approval_status: 'approved' | 'rejected'
  approval_notes: string
}

export default function AdminApprovalPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<ApprovalStats | null>(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [approvalForm, setApprovalForm] = useState<ApprovalFormData>({
    approval_status: 'approved',
    approval_notes: ''
  })

  // 检查用户权限
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // 加载待审核照片
  const loadPendingPhotos = async () => {
    if (!user || user.role !== 'admin') return
    
    setLoading(true)
    try {
      const token = TokenManager.getToken()
      const response = await fetch(`/api/admin/photos/pending?page=${currentPage}&size=12`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('获取待审核照片失败')
      }

      const data: PaginatedResponse = await response.json()
      setPhotos(data.items)
      setTotalPages(data.pages)
    } catch (error) {
      console.error('加载待审核照片失败:', error)
      toast.error('加载待审核照片失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载审核统计
  const loadApprovalStats = async () => {
    if (!user || user.role !== 'admin') return
    
    try {
      const token = TokenManager.getToken()
      const response = await fetch('/api/admin/photos/approval-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('获取审核统计失败')
      }

      const data: ApprovalStats = await response.json()
      setStats(data)
    } catch (error) {
      console.error('加载审核统计失败:', error)
    }
  }

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadPendingPhotos()
      loadApprovalStats()
    }
  }, [user, currentPage])

  // 开始审核
  const startApproval = (photo: Photo) => {
    setSelectedPhoto(photo)
    setApprovalForm({
      approval_status: 'approved',
      approval_notes: ''
    })
    setIsApprovalModalOpen(true)
  }

  // 提交审核
  const submitApproval = async () => {
    if (!selectedPhoto) return

    try {
      const token = TokenManager.getToken()
      const response = await fetch(`/api/admin/photos/${selectedPhoto.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '审核失败')
      }

      const result = await response.json()
      toast.success(result.message)
      
      // 重新加载数据
      loadPendingPhotos()
      loadApprovalStats()
      
      // 关闭模态框
      setIsApprovalModalOpen(false)
      setSelectedPhoto(null)
    } catch (error) {
      console.error('审核失败:', error)
      toast.error(error instanceof Error ? error.message : '审核失败')
    }
  }

  // 取消审核
  const cancelApproval = () => {
    setIsApprovalModalOpen(false)
    setSelectedPhoto(null)
    setApprovalForm({
      approval_status: 'approved',
      approval_notes: ''
    })
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审核'
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return '未知'
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">照片审核</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">审核用户上传的照片</p>
            </div>
            <button
              onClick={() => router.push('/admin/photos')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回照片管理
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待审核</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_pending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已通过</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_approved}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已拒绝</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_rejected}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">%</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">通过率</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approval_rate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 待审核照片列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">待审核照片</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="p-8 text-center">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无待审核的照片</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(photo.approval_status)}`}>
                        {getStatusText(photo.approval_status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{photo.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      上传者: {photo.user?.username || '未知用户'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      主题: {photo.theme || '未分类'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      上传时间: {new Date(photo.uploaded_at).toLocaleString()}
                    </p>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => startApproval(photo)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        审核
                      </button>
                      <button
                        onClick={() => window.open(photo.image_url, '_blank')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  第 {currentPage} 页，共 {totalPages} 页
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 审核模态框 */}
        <Dialog open={isApprovalModalOpen} onClose={cancelApproval} className="relative z-50">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  审核照片
                </Dialog.Title>
                
                {selectedPhoto && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <img
                        src={selectedPhoto.image_url}
                        alt={selectedPhoto.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{selectedPhoto.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        上传者: {selectedPhoto.user?.username || '未知用户'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        主题: {selectedPhoto.theme || '未分类'}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        审核结果
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="approval_status"
                            value="approved"
                            checked={approvalForm.approval_status === 'approved'}
                            onChange={(e) => setApprovalForm({ ...approvalForm, approval_status: e.target.value as 'approved' | 'rejected' })}
                            className="mr-2"
                          />
                          <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">通过</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="approval_status"
                            value="rejected"
                            checked={approvalForm.approval_status === 'rejected'}
                            onChange={(e) => setApprovalForm({ ...approvalForm, approval_status: e.target.value as 'approved' | 'rejected' })}
                            className="mr-2"
                          />
                          <XMarkIcon className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">拒绝</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        审核备注
                      </label>
                      <textarea
                        value={approvalForm.approval_notes}
                        onChange={(e) => setApprovalForm({ ...approvalForm, approval_notes: e.target.value })}
                        placeholder="请输入审核备注（可选）"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={submitApproval}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white ${
                          approvalForm.approval_status === 'approved'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        } transition-colors`}
                      >
                        {approvalForm.approval_status === 'approved' ? '通过审核' : '拒绝审核'}
                      </button>
                      <button
                        onClick={cancelApproval}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

