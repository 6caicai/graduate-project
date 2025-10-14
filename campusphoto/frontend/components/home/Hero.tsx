'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { 
  CameraIcon, 
  TrophyIcon, 
  CalendarIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlusIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: '作品展示',
    description: '上传分享你的摄影作品，获得同学们的认可',
    icon: CameraIcon,
    href: '/photos',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: '摄影比赛',
    description: '参与精彩的摄影比赛，展现你的创意才华',
    icon: TrophyIcon,
    href: '/competitions',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: '摄影师预约',
    description: '预约专业摄影师，记录你的美好时光',
    icon: CalendarIcon,
    href: '/photographers',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: '排行榜',
    description: '查看热门作品和摄影师排行榜',
    icon: ChartBarIcon,
    href: '/rankings',
    color: 'from-purple-500 to-pink-500'
  }
]

export function Hero() {
  const { user, isAuthenticated } = useAuth()
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              {isAuthenticated ? (
                <>
                  <span className="block">欢迎回来，{user?.username}！</span>
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    继续你的创作之旅
                  </span>
                </>
              ) : (
                <>
                  <span className="block">发现美好瞬间</span>
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    记录青春时光
                  </span>
                </>
              )}
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {isAuthenticated ? (
                <>
                  探索更多精彩内容，上传新作品，参与比赛，
                  预约摄影师，与社区互动交流
                </>
              ) : (
                <>
                  加入高校摄影社区，展示你的作品，参与精彩比赛，
                  预约专业摄影师，与同学们分享摄影的乐趣
                </>
              )}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <>
                {/* 仅摄影师和管理员显示上传按钮 */}
                {(user?.role === 'photographer' || user?.role === 'admin') && (
                  <Link
                    href="/upload"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <PlusIcon className="mr-2 w-5 h-5" />
                    上传作品
                  </Link>
                )}
                
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <UserCircleIcon className="mr-2 w-5 h-5" />
            个人中心
          </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  立即加入
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
                
                <Link
                  href="/photos"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  浏览作品
                </Link>
              </>
            )}
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { label: '注册用户', value: '2,000+' },
              { label: '作品数量', value: '10,000+' },
              { label: '活跃比赛', value: '50+' },
              { label: '摄影师', value: '100+' },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRightIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Call to Action Section */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-24 text-center"
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 lg:p-12 text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                准备好展示你的摄影才华了吗？
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                加入我们的摄影社区，与志同道合的朋友一起探索摄影的无限可能
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                免费注册账号
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-24"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  开始你的创作之旅
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  探索更多功能，发现精彩内容，与社区互动交流
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    href="/upload"
                    className="group p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    <PlusIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">上传作品</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">分享你的摄影作品</p>
                  </Link>
                  
                  <Link
                    href="/competitions"
                    className="group p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    <TrophyIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">参加比赛</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">参与精彩摄影比赛</p>
                  </Link>
                  
                  <Link
                    href="/photographers"
                    className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    <CalendarIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">预约拍摄</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">预约专业摄影师</p>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}



