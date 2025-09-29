'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { TokenManager } from '@/lib/api'

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
  is_approved: boolean | null
  uploaded_at: string
  updated_at: string | null
  approval_status: 'pending' | 'approved' | 'rejected'
}

interface PaginatedResponse {
  items: Photo[]
  total: number
  page: number
  size: number
}

export default function AdminPhotosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // 检查权限
  useEffect(() => {
    // 设置超时，避免无限等待
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true)
      }
    }, 2000)

    // 等待认证状态加载完成
    if (authLoading) return
    
    // 如果没有用户，重定向到登录页
    if (!user) {
      clearTimeout(timeout)
      router.push('/auth/login')
      toast.error('请先登录')
      return
    }
    
    // 如果用户不是admin，重定向到首页
    if (user.role !== 'admin') {
      clearTimeout(timeout)
      router.push('/')
      toast.error('无权限访问此页面')
      return
    }
    
    // 权限检查通过后加载照片
    clearTimeout(timeout)
    setIsInitialized(true)
    loadPhotos()
    
    return () => clearTimeout(timeout)
  }, [user, authLoading])

  // 加载照片
  const loadPhotos = async () => {
    try {
      setLoading(true)
      const token = TokenManager.getToken()
      if (!token) {
        toast.error('请先登录')
        return
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '20'
      })
      
      if (statusFilter !== 'all') {
        params.append('status_filter', statusFilter)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/photos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        setPhotos(data.items)
        setTotalPages(Math.ceil(data.total / 20))
      } else {
        const errorText = await response.text()
        console.error('API错误:', response.status, errorText)
        throw new Error(`获取照片失败: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('加载照片失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      toast.error(`加载照片失败: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // 删除单个照片
  const deletePhoto = async (photoId: number) => {
    if (!confirm('确定要删除这张照片吗？')) return

    try {
      const token = TokenManager.getToken()
      if (!token) {
        toast.error('请先登录')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('照片删除成功')
        loadPhotos()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || '删除失败')
      }
    } catch (error) {
      console.error('删除照片失败:', error)
      toast.error('删除照片失败')
    }
  }

  // 批量删除照片
  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.length === 0) {
      toast.error('请选择要删除的照片')
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedPhotos.length} 张照片吗？`)) return

    try {
      const token = TokenManager.getToken()
      if (!token) {
        toast.error('请先登录')
        return
      }

      const response = await fetch('http://localhost:8000/api/admin/bulk-actions/delete-photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedPhotos)
      })

      if (response.ok) {
        toast.success(`成功删除 ${selectedPhotos.length} 张照片`)
        setSelectedPhotos([])
        loadPhotos()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      toast.error('批量删除失败')
    }
  }

  // 切换选择状态
  const togglePhotoSelection = (photoId: number) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([])
    } else {
      setSelectedPhotos(photos.map(photo => photo.id))
    }
  }

  // 当筛选条件变化时重新加载照片
  useEffect(() => {
    if (user && user.role === 'admin' && !authLoading) {
      loadPhotos()
    }
  }, [currentPage, statusFilter, searchQuery])

  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">照片管理</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">管理所有用户上传的照片</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/approval')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                照片审核
              </button>
              <button
                onClick={() => router.push('/admin/analysis')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                分析结果管理
              </button>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索照片标题或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">全部状态</option>
                <option value="approved">已审核</option>
                <option value="pending">待审核</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            <button
              onClick={loadPhotos}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedPhotos.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-red-800 dark:text-red-200">
                已选择 {selectedPhotos.length} 张照片
              </span>
              <button
                onClick={deleteSelectedPhotos}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                批量删除
              </button>
            </div>
          </div>
        )}

        {/* 照片列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              没有找到照片
            </div>
          ) : (
            <>
              {/* 表头 */}
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.length === photos.length && photos.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    全选
                  </span>
                </div>
              </div>

              {/* 照片列表 */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {photos.map((photo) => (
                  <div key={photo.id} className="p-6 flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.includes(photo.id)}
                      onChange={() => togglePhotoSelection(photo.id)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    
                    {/* 缩略图 */}
                    <div className="flex-shrink-0">
                      <img
                        src={`http://localhost:8000${photo.image_url}`}
                        alt={photo.title}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* 照片信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {photo.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          photo.approval_status === 'approved' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : photo.approval_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {photo.approval_status === 'approved' ? '已审核' : 
                           photo.approval_status === 'pending' ? '待审核' : '已拒绝'}
                        </span>
                      </div>
                      {photo.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>ID: {photo.id}</span>
                        <span>用户ID: {photo.user_id}</span>
                        <span>主题: {photo.theme || '未分类'}</span>
                        <span>上传时间: {new Date(photo.uploaded_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      第 {currentPage} 页，共 {totalPages} 页
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
