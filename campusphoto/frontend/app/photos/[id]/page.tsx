'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CameraIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid'
import { AnalysisDisplay } from '@/components/ui/AnalysisDisplay'
import CampusPhotoApi from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Photo {
  id: number
  title: string
  description: string
  image_url: string
  thumbnail_url: string
  theme: string
  confidence: string
  views: number
  likes: number
  favorites: number
  votes: number
  heat_score: string
  uploaded_at: string
  user: {
    id: number
    username: string
    display_name: string
    avatar_url?: string
  }
  analysis?: {
    dominant_colors: Array<{
      name: string
      percentage: number
      hex?: string
    }>
    quality_score: number
    composition: {
      aspect_ratio: number
      golden_ratio_score?: number
      symmetry_score?: number
    }
    tags: string[]
    dimensions: {
      width: number
      height: number
    }
  }
}

export default function PhotoDetailPage() {
  const params = useParams()
  const photoId = params.id as string
  
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  // 加载照片详情
  const loadPhoto = async () => {
    if (!photoId) return
    
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/photos/${photoId}`)
      
      if (response.ok) {
        const photoData = await response.json()
        setPhoto(photoData)
        setIsLiked(photoData.is_liked || false)
        setIsFavorited(photoData.is_favorited || false)
      } else if (response.status === 404) {
        toast.error('作品不存在')
      } else {
        throw new Error(`API调用失败: ${response.status}`)
      }
    } catch (error) {
      console.error('获取照片详情失败:', error)
      toast.error('加载作品详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPhoto()
  }, [photoId])

  const handleLike = async () => {
    if (!photo) return
    
    try {
      if (isLiked) {
        await CampusPhotoApi.unlikePhoto(photo.id)
        setPhoto(prev => prev ? { ...prev, likes: prev.likes - 1 } : null)
      } else {
        await CampusPhotoApi.likePhoto(photo.id)
        setPhoto(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
      toast.error('操作失败')
    }
  }

  const handleFavorite = async () => {
    if (!photo) return
    
    try {
      if (isFavorited) {
        await CampusPhotoApi.unfavoritePhoto(photo.id)
        setPhoto(prev => prev ? { ...prev, favorites: prev.favorites - 1 } : null)
      } else {
        await CampusPhotoApi.favoritePhoto(photo.id)
        setPhoto(prev => prev ? { ...prev, favorites: prev.favorites + 1 } : null)
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error('操作失败')
    }
  }

  const handleShare = async () => {
    if (!photo) return
    
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('分享失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            作品不存在
          </h1>
          <Link 
            href="/photos"
            className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
          >
            返回作品列表
          </Link>
        </div>
      </div>
    )
  }

  // 构建分析数据
  const analysisData = {
    theme: photo.theme,
    confidence: parseFloat(photo.confidence) || 0,
    dominant_colors: photo.analysis?.dominant_colors || [
      { name: '蓝色', percentage: 0.3, hex: '#3B82F6' },
      { name: '绿色', percentage: 0.2, hex: '#10B981' }
    ],
    quality_score: photo.analysis?.quality_score || 0.8,
    composition: photo.analysis?.composition || {
      aspect_ratio: 1.78,
      golden_ratio_score: 0.6,
      symmetry_score: 0.7
    },
    tags: photo.analysis?.tags || [photo.theme, '高质量'],
    dimensions: photo.analysis?.dimensions || { width: 1920, height: 1080 }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮和刷新按钮 */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/photos"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            返回作品列表
          </Link>
          <button
            onClick={loadPhoto}
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '加载中...' : '刷新'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 图片区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <div className="aspect-[4/3] relative">
                <img
                  src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                
                {/* 操作按钮 */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleLike}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleFavorite}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    {isFavorited ? (
                      <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <StarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* 作品信息 */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {photo.title}
                </h1>
                
                {photo.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {photo.description}
                  </p>
                )}
                
                {/* 统计信息 */}
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    {photo.views} 次浏览
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    {photo.likes} 个赞
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    {photo.favorites} 次收藏
                  </div>
                </div>
                
                {/* 作者信息 */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {photo.user.display_name?.[0] || photo.user.username[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {photo.user.display_name || photo.user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(photo.uploaded_at).toISOString().split('T')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 智能分析切换 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                <SparklesIcon className="w-5 h-5" />
                {showAnalysis ? '隐藏智能分析' : '查看智能分析'}
              </button>
            </div>

            {/* 智能分析结果 */}
            {showAnalysis && (
              <AnalysisDisplay analysis={analysisData} />
            )}

            {/* 相关作品 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                相关作品
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  更多 {photo.theme} 主题的作品即将上线...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
