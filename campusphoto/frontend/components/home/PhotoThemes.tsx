'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const themes = [
  {
    name: '校园风光',
    description: '记录校园的美丽景色',
    count: 2847,
    icon: '🏫',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  {
    name: '人物肖像',
    description: '捕捉人物的情感瞬间',
    count: 1923,
    icon: '👤',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
  },
  {
    name: '活动纪实',
    description: '记录精彩的校园活动',
    count: 1654,
    icon: '🎭',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
  },
  {
    name: '动物植物',
    description: '发现自然的生命之美',
    count: 1342,
    icon: '🌿',
    color: 'from-lime-500 to-green-500',
    bgColor: 'from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20'
  },
  {
    name: '夜景',
    description: '探索夜晚的神秘魅力',
    count: 987,
    icon: '🌙',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
  },
  {
    name: '创意摄影',
    description: '展现独特的创意视角',
    count: 756,
    icon: '✨',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
  }
]

export function PhotoThemes() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          热门主题
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          探索不同的摄影主题，发现你的兴趣所在
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link href={`/photos?theme=${encodeURIComponent(theme.name)}`}>
              <div className={`relative bg-gradient-to-br ${theme.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700`}>
                {/* Background Decoration */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${theme.color} opacity-20 rounded-bl-3xl`} />
                
                {/* Icon */}
                <div className="text-4xl mb-4">
                  {theme.icon}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {theme.description}
                    </p>
                  </div>

                  {/* Count */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {theme.count.toLocaleString()} 作品
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((theme.count / 3000) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className={`h-1.5 rounded-full bg-gradient-to-r ${theme.color}`}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* All Themes Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <Link
          href="/photos"
          className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          浏览所有主题
          <ArrowRightIcon className="ml-2 w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  )
}



