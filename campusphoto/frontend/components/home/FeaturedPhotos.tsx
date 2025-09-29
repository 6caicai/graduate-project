'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { HeartIcon, EyeIcon, ArrowRightIcon, FireIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface FeaturedPhoto {
  id: number
  title: string
  image_url: string
  thumbnail_url: string | null
  theme: string | null
  likes: number
  views: number
  heat_score: number
  user: {
    id: number
    username: string
    avatar_url: string | null
  }
}

export function FeaturedPhotos() {
  const [featuredPhotos, setFeaturedPhotos] = useState<FeaturedPhoto[]>([])
  const [loading, setLoading] = useState(true)

  // 加载精选作品数据（使用排行榜API）
  const loadFeaturedPhotos = async () => {
    try {
      setLoading(true)
      
      // 获取本周热门照片，限制4张
      const response = await fetch('/api/rankings/photos?period=week&limit=4')
      
      if (!response.ok) {
        throw new Error('获取精选作品失败')
      }
      
      const data = await response.json()
      setFeaturedPhotos(data)
    } catch (error) {
      console.error('加载精选作品失败:', error)
      toast.error('加载精选作品失败')
      setFeaturedPhotos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeaturedPhotos()
  }, [])
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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : featuredPhotos.length > 0 ? (
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
                  {/* Photo Image */}
                  {photo.image_url ? (
                    <img
                      src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-4xl">📷</span>
                    </div>
                  )}
                  
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
                          <div className="flex items-center space-x-1">
                            <FireIcon className="w-4 h-4" />
                            <span>{photo.heat_score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Badge */}
                  {photo.theme && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-medium bg-black/20 text-white rounded-lg backdrop-blur-sm">
                        {photo.theme}
                      </span>
                    </div>
                  )}
                </div>

                {/* Photo Info */}
                <div className="mt-3 space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {photo.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    {photo.user.avatar_url ? (
                      <img
                        src={photo.user.avatar_url}
                        alt={photo.user.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    )}
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
                    <div className="flex items-center space-x-1">
                      <FireIcon className="w-4 h-4" />
                      <span>{photo.heat_score}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-6xl mb-4">📷</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            暂无精选作品
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            还没有足够的热门作品展示
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            上传作品
            <ArrowRightIcon className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}

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



