'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrophyIcon, 
  StarIcon, 
  HeartIcon, 
  EyeIcon,
  ArrowRightIcon,
  FireIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

// 模拟排行榜数据
const mockRankings = {
  photos: [
    {
      id: 1,
      title: '夕阳下的校园',
      user: { username: '张三', avatar: '/placeholder-avatar.jpg' },
      image: '/placeholder-photo-1.jpg',
      likes: 1245,
      views: 8520,
      heat_score: 95.8,
      rank: 1,
      theme: '校园风光'
    },
    {
      id: 2,
      title: '青春记忆',
      user: { username: '李四', avatar: '/placeholder-avatar.jpg' },
      image: '/placeholder-photo-2.jpg',
      likes: 1089,
      views: 6980,
      heat_score: 92.3,
      rank: 2,
      theme: '人物肖像'
    },
    {
      id: 3,
      title: '春天的樱花',
      user: { username: '王五', avatar: '/placeholder-avatar.jpg' },
      image: '/placeholder-photo-3.jpg',
      likes: 956,
      views: 6150,
      heat_score: 89.7,
      rank: 3,
      theme: '动物植物'
    }
  ],
  photographers: [
    {
      id: 1,
      username: '张三',
      avatar: '/placeholder-avatar.jpg',
      rating: 4.9,
      photosCount: 234,
      totalLikes: 15420,
      rank: 1,
      specialties: ['人像摄影', '活动拍摄']
    },
    {
      id: 2,
      username: '李四',
      avatar: '/placeholder-avatar.jpg',
      rating: 4.8,
      photosCount: 189,
      totalLikes: 12890,
      rank: 2,
      specialties: ['风光摄影', '建筑摄影']
    },
    {
      id: 3,
      username: '王五',
      avatar: '/placeholder-avatar.jpg',
      rating: 4.7,
      photosCount: 156,
      totalLikes: 9870,
      rank: 3,
      specialties: ['创意摄影', '艺术摄影']
    }
  ]
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
  const [rankings, setRankings] = useState(mockRankings)

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              排行榜
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              发现最受欢迎的作品和摄影师
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
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
        </motion.div>

        {/* Time Period Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
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
        </motion.div>

        {/* Rankings Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeType === 'photos' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                热门作品排行
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {rankings.photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Rank Badge */}
                    <div className="relative">
                      <div className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white ${getRankColor(photo.rank)}`}>
                        {getRankIcon(photo.rank)}
                      </div>
                      
                      {/* Photo */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TrophyIcon className="w-16 h-16 text-pink-500" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {photo.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                          <span>{photo.user.username}</span>
                        </div>
                        <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 text-xs rounded-full">
                          {photo.theme}
                        </span>
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
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                摄影师排行
              </h2>
              
              <div className="space-y-6">
                {rankings.photographers.map((photographer, index) => (
                  <motion.div
                    key={photographer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
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
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
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
                              {photographer.photosCount}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">作品数</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {photographer.totalLikes.toLocaleString()}
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
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
