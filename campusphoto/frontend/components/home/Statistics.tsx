'use client'

import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  CameraIcon, 
  TrophyIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const stats = [
  {
    id: 1,
    name: '注册用户',
    value: '2,847',
    change: '+12.5%',
    changeType: 'increase',
    icon: UsersIcon,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    name: '作品总数',
    value: '12,394',
    change: '+8.3%',
    changeType: 'increase',
    icon: CameraIcon,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    name: '比赛数量',
    value: '156',
    change: '+23.1%',
    changeType: 'increase',
    icon: TrophyIcon,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 4,
    name: '月活跃用户',
    value: '1,429',
    change: '+5.7%',
    changeType: 'increase',
    icon: ChartBarIcon,
    color: 'from-purple-500 to-pink-500'
  }
]

export function Statistics() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          平台数据
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          实时更新的平台统计数据
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
          >
            {/* Background Gradient */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-3xl`} />
            
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'increase' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.name}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${65 + index * 10}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              98.5%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              用户满意度
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              4.8/5.0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              平台评分
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              24/7
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              在线服务
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}



