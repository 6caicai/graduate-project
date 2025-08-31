'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrophyIcon, 
  UsersIcon, 
  CalendarIcon, 
  ArrowRightIcon,
  FireIcon 
} from '@heroicons/react/24/outline'

// 模拟活跃比赛数据
const activeCompetitions = [
  {
    id: 1,
    name: '春季校园摄影大赛',
    description: '捕捉春天校园的美丽瞬间，展现青春活力',
    theme: '校园风光',
    status: 'active',
    participants: 156,
    submissions: 324,
    endTime: '2024-04-30',
    prize: '一等奖 ¥3000',
    image: '/placeholder-competition-1.jpg'
  },
  {
    id: 2,
    name: '人像摄影挑战赛',
    description: '展现人物的情感和故事，记录真实的美好',
    theme: '人物肖像',
    status: 'voting',
    participants: 89,
    submissions: 178,
    endTime: '2024-04-25',
    prize: '最佳人气奖',
    image: '/placeholder-competition-2.jpg'
  },
  {
    id: 3,
    name: '创意摄影月赛',
    description: '释放你的创意，用镜头展现独特的视角',
    theme: '创意摄影',
    status: 'active',
    participants: 203,
    submissions: 445,
    endTime: '2024-05-15',
    prize: '创意大奖',
    image: '/placeholder-competition-3.jpg'
  }
]

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active':
      return {
        text: '投稿中',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: '🟢'
      }
    case 'voting':
      return {
        text: '投票中',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: '🗳️'
      }
    case 'closed':
      return {
        text: '已结束',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        icon: '⏰'
      }
    default:
      return {
        text: '草稿',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: '📝'
      }
  }
}

export function ActiveCompetitions() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <FireIcon className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              热门比赛
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            参与精彩的摄影比赛，展现你的才华
          </p>
        </div>
        <Link
          href="/competitions"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          查看全部
          <ArrowRightIcon className="ml-1 w-4 h-4" />
        </Link>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCompetitions.map((competition, index) => {
          const statusInfo = getStatusInfo(competition.status)
          
          return (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/competitions/${competition.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  {/* Competition Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-gray-700 dark:to-gray-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrophyIcon className="w-16 h-16 text-primary-400 dark:text-gray-500" />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <span className="mr-1">{statusInfo.icon}</span>
                        {statusInfo.text}
                      </span>
                    </div>

                    {/* Prize Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        🏆 {competition.prize}
                      </span>
                    </div>
                  </div>

                  {/* Competition Info */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Title and Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {competition.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {competition.description}
                        </p>
                      </div>

                      {/* Theme */}
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          📸 {competition.theme}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <UsersIcon className="w-4 h-4" />
                          <span>{competition.participants} 参与者</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <TrophyIcon className="w-4 h-4" />
                          <span>{competition.submissions} 作品</span>
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span>截止时间：{competition.endTime}</span>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <button className="w-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                          立即参与
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center py-8"
      >
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
          <TrophyIcon className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            准备好赢得大奖了吗？
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            参与我们的摄影比赛，展示你的才华，赢取丰厚奖品
          </p>
          <Link
            href="/competitions"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            查看所有比赛
            <ArrowRightIcon className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}



