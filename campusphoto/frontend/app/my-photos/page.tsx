'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  PhotoIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

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
  heat_score: number
  competition_id: number | null
  is_approved: boolean
  approval_status: string
  approval_notes: string | null
  approved_by: number | null
  approved_at: string | null
  uploaded_at: string
  updated_at: string | null
}

interface PaginatedResponse {
  items: Photo[]
  total: number
  page: number
  size: number
  pages: number
}

export default function MyPhotosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')

  // 加载用户照片
  const loadPhotos = async (page: number = 1) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        toast.error('请先登录')
        router.push('/auth/login')
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: '12'
      })

      const response = await fetch(`/api/users/${user.id}/photos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('获取照片失败')
      }

      const data: PaginatedResponse = await response.json()
      setPhotos(data.items)
      setTotalPages(data.pages)
      setTotalPhotos(data.total)
      setCurrentPage(page)
    } catch (error) {
      console.error('加载照片失败:', error)
      setError(error instanceof Error ? error.message : '未知错误')
      toast.error('加载照片失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除照片
  const deletePhoto = async (photoId: number) => {
    if (!confirm('确定要删除这张照片吗？此操作不可撤销。')) {
      return
    }

    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        toast.error('请先登录')
        return
      }

      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      toast.success('照片删除成功')
      loadPhotos(currentPage) // 重新加载当前页
    } catch (error) {
      console.error('删除照片失败:', error)
      toast.error('删除照片失败')
    }
  }

  // 获取审核状态图标
  const getApprovalIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'pending':
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  // 获取审核状态文本
  const getApprovalText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      case 'pending':
      default:
        return '待审核'
    }
  }

  // 过滤照片
  const filteredPhotos = photos.filter(photo => {
    if (filter === 'all') return true
    return photo.approval_status === filter
  })

  useEffect(() => {
    if (!authLoading && user) {
      loadPhotos()
    } else if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  我的作品
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  管理你的摄影作品
                </p>
              </div>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              上传新作品
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <PhotoIcon className="w-8 h-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总作品数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPhotos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">已通过</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {photos.filter(p => p.approval_status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">待审核</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {photos.filter(p => p.approval_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <EyeIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总浏览</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {photos.reduce((sum, p) => sum + p.views, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'approved', label: '已通过' },
              { key: 'pending', label: '待审核' },
              { key: 'rejected', label: '已拒绝' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? '还没有作品' : '没有符合条件的作品'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? '开始上传你的第一张作品吧！' 
                : '尝试其他筛选条件或上传新作品'
              }
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              上传作品
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Photo */}
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 relative">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Approval Status */}
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                        {getApprovalIcon(photo.approval_status)}
                        <span>{getApprovalText(photo.approval_status)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => router.push(`/photos/${photo.id}/edit`)}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                          title="编辑"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="p-1 bg-black/50 text-white rounded hover:bg-red-600 transition-colors"
                          title="删除"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {photo.title}
                    </h3>
                    
                    {photo.theme && (
                      <div className="mb-2">
                        <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 text-xs rounded-full">
                          {photo.theme}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          <span>{photo.views}</span>
                        </div>
                        <div className="flex items-center">
                          <HeartIcon className="w-4 h-4 mr-1" />
                          <span>{photo.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 mr-1" />
                          <span>{photo.heat_score}</span>
                        </div>
                      </div>
                      <span className="text-xs">
                        {new Date(photo.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* View Button */}
                    <div className="mt-3">
                      <Link
                        href={`/photos/${photo.id}`}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadPhotos(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => loadPhotos(page)}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => loadPhotos(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

