'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { HeartIcon, EyeIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

// 模拟精选作品数据
const featuredPhotos = [
  {
    id: 1,
    title: '夕阳下的校园',
    user: { username: '张三', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-1.jpg',
    likes: 245,
    views: 1520,
    theme: '校园风光'
  },
  {
    id: 2,
    title: '青春记忆',
    user: { username: '李四', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-2.jpg',
    likes: 189,
    views: 980,
    theme: '人物肖像'
  },
  {
    id: 3,
    title: '春天的樱花',
    user: { username: '王五', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-3.jpg',
    likes: 312,
    views: 2150,
    theme: '动物植物'
  },
  {
    id: 4,
    title: '创意光影',
    user: { username: '赵六', avatar: '/placeholder-avatar.jpg' },
    image: '/placeholder-photo-4.jpg',
    likes: 156,
    views: 850,
    theme: '创意摄影'
  }
]

export function FeaturedPhotos() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            精选作品
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            发现最受欢迎的摄影作品
          </p>
        </div>
        <Link
          href="/photos"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          查看更多
          <ArrowRightIcon className="ml-1 w-4 h-4" />
        </Link>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredPhotos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <Link href={`/photos/${photo.id}`}>
              <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 aspect-square">
                {/* Placeholder for photo */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-4xl">📷</span>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{photo.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{photo.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium bg-black/20 text-white rounded-lg backdrop-blur-sm">
                    {photo.theme}
                  </span>
                </div>
              </div>

              {/* Photo Info */}
              <div className="mt-3 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {photo.title}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {photo.user.username}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4" />
                    <span>{photo.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{photo.views}</span>
                  </div>
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
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            想要展示你的作品吗？
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            上传你的摄影作品，与更多人分享你的创意
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            上传作品
            <ArrowRightIcon className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}



