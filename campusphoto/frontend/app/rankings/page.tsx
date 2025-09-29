'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  TrophyIcon, 
  StarIcon, 
  HeartIcon, 
  EyeIcon,
  ArrowRightIcon,
  FireIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface PhotoRankingItem {
  id: number
  title: string
  image_url: string
  thumbnail_url: string | null
  theme: string | null
  likes: number
  views: number
  heat_score: number
  rank: number
  user: {
    id: number
    username: string
    avatar_url: string | null
  }
}

interface PhotographerRankingItem {
  id: number
  username: string
  avatar_url: string | null
  rating: number
  photos_count: number
  total_likes: number
  rank: number
  specialties: string[]
}

interface RankingStats {
  total_photos: number
  total_photographers: number
  period: string
}

const timePeriods = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
  { key: 'all', label: '全部' }
]

const rankingTypes = [
  { key: 'photos', label: '作品排行' },
  { key: 'photographers', label: '摄影师排行' }
]

export default function RankingsPage() {
  const [activeType, setActiveType] = useState('photos')
  const [activePeriod, setActivePeriod] = useState('week')
  const [photos, setPhotos] = useState<PhotoRankingItem[]>([])
  const [photographers, setPhotographers] = useState<PhotographerRankingItem[]>([])
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [loading, setLoading] = useState(false)


  // 加载排行榜数据
  const loadRankings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period: activePeriod,
        limit: '20'
      })

      if (activeType === 'photos') {
        const response = await fetch(`/api/rankings/photos?${params}`)
        
        if (!response.ok) {
          throw new Error('获取照片排行榜失败')
        }
        const data = await response.json()
        setPhotos(data)
      } else {
        const response = await fetch(`/api/rankings/photographers?${params}`)
        
        if (!response.ok) {
          throw new Error('获取摄影师排行榜失败')
        }
        const data = await response.json()
        setPhotographers(data)
      }

      // 加载统计信息
      const statsResponse = await fetch(`/api/rankings/stats?period=${activePeriod}`)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('加载排行榜失败:', error)
      toast.error('加载排行榜失败')
    } finally {
      setLoading(false)
    }
  }

  // 当类型或周期改变时重新加载数据
  useEffect(() => {
    loadRankings()
  }, [activeType, activePeriod])

  // 页面加载时也调用一次
  useEffect(() => {
    loadRankings()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />
      case 2:
        return <TrophyIcon className="w-6 h-6 text-gray-400" />
      case 3:
        return <TrophyIcon className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600'
      default:
        return 'bg-gray-200 dark:bg-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              排行榜
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              发现最受欢迎的作品和摄影师
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {rankingTypes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeType === key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="mb-8">
          <div className="flex gap-2">
            {timePeriods.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActivePeriod(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePeriod === key
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings Content */}
        <div>
          {activeType === 'photos' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  热门作品排行
                </h2>
                {stats && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    共 {stats.total_photos} 张照片
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12">
                  <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">暂无排行榜数据</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      {/* Rank Badge */}
                      <div className="relative">
                        <div className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white ${getRankColor(photo.rank)}`}>
                          {getRankIcon(photo.rank)}
                        </div>
                        
                        {/* Photo */}
                        <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700">
                          {photo.image_url ? (
                            <img
                              src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <span className="text-gray-500 dark:text-gray-400">无图片</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {photo.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center">
                            {photo.user.avatar_url ? (
                              <img
                                src={photo.user.avatar_url}
                                alt={photo.user.username}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                            )}
                            <span>{photo.user.username}</span>
                          </div>
                          {photo.theme && (
                            <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 text-xs rounded-full">
                              {photo.theme}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center text-red-500 mb-1">
                              <HeartIcon className="w-4 h-4 mr-1" />
                              <span className="font-semibold">{photo.likes}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">点赞</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center text-blue-500 mb-1">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              <span className="font-semibold">{photo.views}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">浏览</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center text-orange-500 mb-1">
                              <FireIcon className="w-4 h-4 mr-1" />
                              <span className="font-semibold">{photo.heat_score}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">热度</div>
                          </div>
                        </div>

                        <Link
                          href={`/photos/${photo.id}`}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                        >
                          查看详情
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  摄影师排行
                </h2>
                {stats && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    共 {stats.total_photographers} 位摄影师
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
                </div>
              ) : photographers.length === 0 ? (
                <div className="text-center py-12">
                  <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">暂无摄影师数据</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {photographers.map((photographer, index) => (
                    <div
                      key={photographer.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8"
                    >
                      <div className="flex items-center">
                        {/* Rank */}
                        <div className="flex-shrink-0 mr-6">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getRankColor(photographer.rank)}`}>
                            {getRankIcon(photographer.rank)}
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="flex-shrink-0 mr-4">
                          {photographer.avatar_url ? (
                            <img
                              src={photographer.avatar_url}
                              alt={photographer.username}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {photographer.username}
                            </h3>
                            <div className="flex items-center text-yellow-500">
                              <StarIcon className="w-5 h-5 mr-1" />
                              <span className="font-semibold">{photographer.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {photographer.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 text-sm rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {photographer.photos_count}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">作品数</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {photographer.total_likes.toLocaleString()}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">总点赞</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {photographer.rank}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">排名</div>
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0 ml-4">
                          <Link
                            href={`/photographers/${photographer.id}`}
                            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                          >
                            查看详情
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}