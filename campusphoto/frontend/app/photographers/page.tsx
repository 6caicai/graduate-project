'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CameraIcon, 
  StarIcon, 
  MapPinIcon, 
  CalendarIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

// 模拟摄影师数据
const mockPhotographers = [
  {
    id: 1,
    username: '张三',
    bio: '专业人像摄影师，5年校园摄影经验',
    avatar: '/placeholder-avatar.jpg',
    rating: 4.9,
    reviewCount: 127,
    photosCount: 234,
    appointmentsCount: 89,
    specialties: ['人像摄影', '活动拍摄'],
    location: '北京',
    verified: true,
    price: 200,
    available: true
  },
  {
    id: 2,
    username: '李四',
    bio: '风光摄影爱好者，捕捉校园四季之美',
    avatar: '/placeholder-avatar.jpg',
    rating: 4.8,
    reviewCount: 93,
    photosCount: 156,
    appointmentsCount: 67,
    specialties: ['风光摄影', '建筑摄影'],
    location: '上海',
    verified: true,
    price: 150,
    available: true
  },
  {
    id: 3,
    username: '王五',
    bio: '创意摄影师，擅长艺术创作和概念摄影',
    avatar: '/placeholder-avatar.jpg',
    rating: 4.7,
    reviewCount: 74,
    photosCount: 189,
    appointmentsCount: 52,
    specialties: ['创意摄影', '艺术摄影'],
    location: '广州',
    verified: false,
    price: 300,
    available: false
  }
]

const specialties = [
  { key: 'all', label: '全部' },
  { key: '人像摄影', label: '人像摄影' },
  { key: '风光摄影', label: '风光摄影' },
  { key: '活动拍摄', label: '活动拍摄' },
  { key: '创意摄影', label: '创意摄影' }
]

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState(mockPhotographers)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesFilter = filter === 'all' || photographer.specialties.includes(filter)
    const matchesSearch = photographer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photographer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photographer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const sortedPhotographers = [...filteredPhotographers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price_low':
        return a.price - b.price
      case 'price_high':
        return b.price - a.price
      case 'reviews':
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

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
              摄影师
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              预约专业摄影师，记录你的美好时光
            </p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索摄影师或专业领域..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Specialty Filter */}
            <div className="flex gap-2">
              {specialties.map(({ key, label }) => (
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
              <option value="rating">评分最高</option>
              <option value="price_low">价格最低</option>
              <option value="price_high">价格最高</option>
              <option value="reviews">评价最多</option>
            </select>
          </div>
        </motion.div>

        {/* Photographers Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {sortedPhotographers.map((photographer, index) => (
            <motion.div
              key={photographer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Header */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {photographer.username}
                        </h3>
                        {photographer.verified && (
                          <svg className="w-5 h-5 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{photographer.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    photographer.available 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {photographer.available ? '可预约' : '忙碌中'}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {photographer.bio}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {photographer.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 text-xs font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="flex items-center justify-center text-yellow-500 mb-1">
                      <StarIcon className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{photographer.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {photographer.reviewCount} 评价
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {photographer.photosCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">作品</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {photographer.appointmentsCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">预约</div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ¥{photographer.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/次</span>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/photographers/${photographer.id}`}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    photographer.available
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {photographer.available ? '立即预约' : '暂时不可预约'}
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {sortedPhotographers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无摄影师
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? '没有找到匹配的摄影师' : '暂时没有可用的摄影师'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
