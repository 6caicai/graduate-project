'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRequireAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  CameraIcon, 
  PhotoIcon, 
  TrophyIcon, 
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserIcon,
  PencilIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    avatar_url: ''
  })

  // 加载个人资料
  const loadProfile = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // 获取用户资料
      const profileResponse = await fetch(`/api/users/${user.id}`, { headers })
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData)
        setEditForm({
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        })
      }
    } catch (error) {
      console.error('加载个人资料失败:', error)
    }
  }

  // 更新个人资料
  const updateProfile = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        toast.error('请先登录')
        return
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio: editForm.bio,
          avatar_url: editForm.avatar_url
        })
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        toast.success('个人资料更新成功')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || '更新失败')
      }
    } catch (error) {
      console.error('更新个人资料失败:', error)
      toast.error('更新个人资料失败')
    }
  }

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])
  
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


  // 根据用户角色显示不同的快速操作
  const getQuickActions = () => {
    const baseActions = [
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

    // 摄影师和管理员可以上传作品和参加比赛
    if (user?.role === 'photographer' || user?.role === 'admin') {
      return [
        {
          name: '上传作品',
          description: '分享你的摄影作品',
          href: '/upload',
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
        ...baseActions
      ]
    }

    return baseActions
  }

  const quickActions = getQuickActions()

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

        {/* Profile Section */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-32"></div>
            
            <div className="px-8 pb-8 -mt-16">
              {/* Avatar and Basic Info */}
              <div className="flex items-end space-x-6 mb-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <UserIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <button className="absolute bottom-2 right-2 bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile?.username}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile?.role === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : profile?.role === 'photographer'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {profile?.role === 'admin' ? '管理员' : 
                       profile?.role === 'photographer' ? '摄影师' : '学生'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>加入于 {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      <span>{profile?.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>{editing ? '取消编辑' : '编辑资料'}</span>
                </button>
              </div>

              {/* Bio */}
              {editing ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    个人简介
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="介绍一下自己..."
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    {profile?.bio || '这个人很懒，什么都没有留下...'}
                  </p>
                </div>
              )}

              {/* Edit Actions */}
              {editing && (
                <div className="flex space-x-4">
                  <button
                    onClick={updateProfile}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    保存更改
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}



        {/* 快速操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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

      </div>
    </div>
  )
}

