'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  StarIcon, 
  CameraIcon, 
  CalendarIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

// 模拟热门摄影师数据
const photographers = [
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
    verified: true
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
    verified: true
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
    verified: false
  },
  {
    id: 4,
    username: '赵六',
    bio: '纪实摄影师，记录真实的校园生活',
    avatar: '/placeholder-avatar.jpg',
    rating: 4.8,
    reviewCount: 105,
    photosCount: 267,
    appointmentsCount: 78,
    specialties: ['纪实摄影', '街拍'],
    location: '深圳',
    verified: true
  }
]

export function PopularPhotographers() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            热门摄影师
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            预约优秀的摄影师，记录你的美好时光
          </p>
        </div>
        <Link
          href="/photographers"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          查看全部
          <ArrowRightIcon className="ml-1 w-4 h-4" />
        </Link>
      </div>

      {/* Photographers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {photographers.map((photographer, index) => (
          <motion.div
            key={photographer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link href={`/photographers/${photographer.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                {/* Avatar and Verification */}
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    {photographer.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {photographer.username}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    📍 {photographer.location}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 line-clamp-2">
                  {photographer.bio}
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {photographer.rating}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({photographer.reviewCount})
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {photographer.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                      <CameraIcon className="w-4 h-4" />
                      <span>{photographer.photosCount}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      作品
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{photographer.appointmentsCount}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      预约
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <button className="w-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    立即预约
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center py-8"
      >
        <div className="bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
          <CameraIcon className="w-12 h-12 text-secondary-600 dark:text-secondary-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            成为平台摄影师
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            分享你的摄影技能，帮助更多同学记录美好时光，同时获得收益
          </p>
          <Link
            href="/apply-photographer"
            className="inline-flex items-center px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
          >
            申请成为摄影师
            <ArrowRightIcon className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}



