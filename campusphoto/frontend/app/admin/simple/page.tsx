'use client'

import { useState, useEffect } from 'react'
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

export default function AdminSimplePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    // 直接从localStorage获取用户信息
    const storedUser = TokenManager.getUser()
    const token = TokenManager.getToken()
    
    if (storedUser && token) {
      setUser(storedUser)
      
      // 检查是否是admin
      if (storedUser.role === 'admin') {
        loadPhotos()
      } else {
        toast.error('无权限访问此页面')
        router.push('/')
      }
    } else {
      toast.error('请先登录')
      router.push('/auth/login')
    }
    
    setLoading(false)
  }, [])

  const loadPhotos = async () => {
    try {
      const token = TokenManager.getToken()
      const response = await fetch('http://localhost:8000/api/admin/photos?page=1&size=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPhotos(data.items || [])
      } else {
        throw new Error('获取照片失败')
      }
    } catch (error) {
      console.error('加载照片失败:', error)
      toast.error('加载照片失败')
    }
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">简单照片管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">用户: {user.username} ({user.role})</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">照片列表</h2>
            
            {photos.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                没有找到照片
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <img
                      src={`http://localhost:8000${photo.image_url}`}
                      alt={photo.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {photo.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>ID: {photo.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

