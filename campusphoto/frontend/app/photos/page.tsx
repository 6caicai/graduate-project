'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CameraIcon, 
  HeartIcon, 
  EyeIcon, 
  ArrowRightIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
// import { CampusPhotoApi } from '@/lib/api'

// 模拟作品数据
const mockPhotos = [
  {
    id: 1,
    title: '夕阳下的校园',
    user: { username: '张三', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-1.jpg',
    likes: 245,
    views: 1520,
    theme: '校园风光',
    uploaded_at: '2024-03-15',
    is_liked: false,
    is_favorited: false
  },
  {
    id: 2,
    title: '青春记忆',
    user: { username: '李四', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-2.jpg',
    likes: 189,
    views: 980,
    theme: '人物肖像',
    uploaded_at: '2024-03-14',
    is_liked: true,
    is_favorited: false
  },
  {
    id: 3,
    title: '春天的樱花',
    user: { username: '王五', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-3.jpg',
    likes: 312,
    views: 2150,
    theme: '动物植物',
    uploaded_at: '2024-03-13',
    is_liked: false,
    is_favorited: true
  },
  {
    id: 4,
    title: '创意光影',
    user: { username: '赵六', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-4.jpg',
    likes: 156,
    views: 850,
    theme: '创意摄影',
    uploaded_at: '2024-03-12',
    is_liked: false,
    is_favorited: false
  }
]

const themes = [
  { key: 'all', label: '全部' },
  { key: '校园风光', label: '校园风光' },
  { key: '人物肖像', label: '人物肖像' },
  { key: '动物植物', label: '动物植物' },
  { key: '创意摄影', label: '创意摄影' }
]

export default function PhotosPage() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // 加载照片数据
  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:8000/api/photos/')
      
      if (response.ok) {
        const data = await response.json()
        
        // 过滤掉可能无效的图片（基于已知的404图片）
        const validPhotos = (data.items || []).filter((photo: any) => {
          const filename = photo.image_url?.split('/')[-1] || ''
          const invalidImages = [
            'test_analysis_final.jpg', 'P1139746.JPG', 'test_student_6.jpg', 
            'test_student_3.jpg', 'test_student_2.jpg', 'test_student_4.jpg', 
            'test_student_5.jpg', 'test_student_1.jpg', 'test_image2.jpg', 
            'test_admin_upload.jpg'
          ]
          return !invalidImages.includes(filename)
        })
        
        setPhotos(validPhotos)
      } else {
        throw new Error(`API调用失败: ${response.status}`)
      }
    } catch (error) {
      console.error('获取照片失败:', error)
      setError(error instanceof Error ? error.message : '未知错误')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时自动加载照片
  useEffect(() => {
    loadPhotos()
  }, [])


  const filteredPhotos = photos.filter(photo => {
    const matchesFilter = filter === 'all' || photo.theme === filter
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (photo.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // 调试信息
  console.log('当前状态 - photos数量:', photos.length, 'filteredPhotos数量:', filteredPhotos.length)

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      case 'popular':
        return b.likes - a.likes
      case 'views':
        return b.views - a.views
      default:
        return 0
    }
  })

  const handleLike = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, is_liked: !photo.is_liked, likes: photo.is_liked ? photo.likes - 1 : photo.likes + 1 }
        : photo
    ))
  }

  const handleFavorite = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, is_favorited: !photo.is_favorited }
        : photo
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载作品中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              摄影作品
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              发现精彩的摄影作品，与同学们分享你的创作
            </p>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              加载照片失败: {error}
            </p>
          </div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜索作品或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              上传作品
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Theme Filter */}
            <div className="flex gap-2">
              {themes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
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

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="latest">最新上传</option>
              <option value="popular">最受欢迎</option>
              <option value="views">最多浏览</option>
            </select>
          </div>
        </motion.div>

        {/* Photos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {sortedPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => window.location.href = `/photos/${photo.id}`}
            >
              {/* Photo */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                {photo.image_url ? (
                  <img
                    src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CameraIcon className="w-16 h-16 text-pink-500" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                      {photo.theme}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(photo.id)
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        photo.is_liked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <HeartIcon className={`w-5 h-5 ${photo.is_liked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFavorite(photo.id)
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        photo.is_favorited 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-white/80 text-gray-700 hover:bg-yellow-500 hover:text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={photo.is_favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {photo.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                    <span>{photo.user?.username || '未知用户'}</span>
                  </div>
                  <span>{new Date(photo.uploaded_at).toISOString().split('T')[0]}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      <span>{photo.likes}</span>
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{photo.views}</span>
                    </div>
                  </div>
                  <Link
                    href={`/photos/${photo.id}`}
                    className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {sortedPhotos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无作品
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? '没有找到匹配的作品' : '暂时没有可用的作品'}
            </p>
            {!searchQuery && (
              <Link
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                上传第一个作品
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

