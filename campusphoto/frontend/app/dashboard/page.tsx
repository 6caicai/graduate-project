'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRequireAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { 
  CameraIcon, 
  PhotoIcon, 
  TrophyIcon, 
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = [
    {
      name: '我的作品',
      value: '12',
      icon: PhotoIcon,
      change: '+2',
      changeType: 'positive'
    },
    {
      name: '获得点赞',
      value: '1,234',
      icon: CameraIcon,
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: '参与比赛',
      value: '3',
      icon: TrophyIcon,
      change: '+1',
      changeType: 'positive'
    },
    {
      name: '预约拍摄',
      value: '5',
      icon: CalendarIcon,
      change: '+2',
      changeType: 'positive'
    }
  ]

  const quickActions = [
    {
      name: '上传作品',
      description: '分享你的摄影作品',
      href: '/photos/upload',
      icon: PhotoIcon,
      color: 'bg-pink-500'
    },
    {
      name: '参加比赛',
      description: '参与摄影比赛',
      href: '/competitions',
      icon: TrophyIcon,
      color: 'bg-purple-500'
    },
    {
      name: '预约拍摄',
      description: '预约专业摄影师',
      href: '/appointments',
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: '查看排行榜',
      description: '查看作品排名',
      href: '/rankings',
      icon: ChartBarIcon,
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎信息 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            欢迎回来，{user.username}！
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {user.role === 'admin' && '系统管理员'}
            {user.role === 'photographer' && '专业摄影师'}
            {user.role === 'student' && '学生用户'}
            · 继续你的摄影创作之旅
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change} 较上月
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 快速操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            快速操作
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* 最近活动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              最近活动
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <PhotoIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    上传了新作品《校园春色》
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2小时前
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    在"春日摄影大赛"中获得第3名
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1天前
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    预约了明天的人像拍摄
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2天前
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

