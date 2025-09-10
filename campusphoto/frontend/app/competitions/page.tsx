'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrophyIcon, 
  UsersIcon, 
  CalendarIcon, 
  FireIcon,
  ArrowRightIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

// 模拟比赛数据
const mockCompetitions = [
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
    image: '/placeholder-competition-1.jpg',
    rules: '作品必须为原创，主题明确，构图优美',
    prizes: {
      first: '¥3000',
      second: '¥2000', 
      third: '¥1000'
    }
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
    image: '/placeholder-competition-2.jpg',
    rules: '人物肖像作品，注重情感表达',
    prizes: {
      first: '最佳人气奖',
      second: '创意奖',
      third: '技术奖'
    }
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
    image: '/placeholder-competition-3.jpg',
    rules: '创意摄影作品，鼓励创新思维',
    prizes: {
      first: '创意大奖',
      second: '视觉冲击奖',
      third: '概念奖'
    }
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  voting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

const statusText = {
  active: '进行中',
  voting: '投票中',
  closed: '已结束'
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState(mockCompetitions)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCompetitions = competitions.filter(comp => {
    const matchesFilter = filter === 'all' || comp.status === filter
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.theme.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
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
              摄影比赛
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              参与精彩的摄影比赛，展现你的创意才华，赢取丰厚奖品
            </p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索比赛..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <FunnelIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'active', label: '进行中' },
              { key: 'voting', label: '投票中' },
              { key: 'closed', label: '已结束' }
            ].map(({ key, label }) => (
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

          {/* Create Competition Button */}
          <Link
            href="/competitions/create"
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            创建比赛
          </Link>
        </motion.div>

        {/* Competitions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCompetitions.map((competition, index) => (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Competition Image */}
              <div className="relative h-56 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrophyIcon className="w-16 h-16 text-pink-500" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[competition.status as keyof typeof statusColors]}`}>
                    {statusText[competition.status as keyof typeof statusText]}
                  </span>
                </div>
              </div>

              {/* Competition Content */}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {competition.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {competition.description}
                </p>

                {/* Theme */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 text-xs font-medium rounded-full">
                    {competition.theme}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    <span>{competition.participants} 人参与</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>截止 {competition.endTime}</span>
                  </div>
                </div>

                {/* Prize */}
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      奖品: {competition.prize}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/competitions/${competition.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors group"
                >
                  查看详情
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCompetitions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无比赛
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? '没有找到匹配的比赛' : '暂时没有可用的比赛'}
            </p>
            {!searchQuery && (
              <Link
                href="/competitions/create"
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                创建第一个比赛
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
