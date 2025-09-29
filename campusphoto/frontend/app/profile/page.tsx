'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { 
  UserIcon,
  CameraIcon,
  PencilIcon,
  HeartIcon,
  EyeIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  PhotoIcon,
  TrophyIcon,
  FireIcon
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

interface UserStats {
  total_photos: number
  total_likes: number
  total_views: number
  total_favorites: number
  average_rating: number
  rank: number
}

interface UserPhoto {
  id: number
  title: string
  image_url: string
  thumbnail_url: string | null
  theme: string | null
  likes: number
  views: number
  heat_score: number
  uploaded_at: string
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [photos, setPhotos] = useState<UserPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    avatar_url: ''
  })

  // 加载用户资料
  const loadProfile = async () => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        toast.error('请先登录')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
      
      // 获取用户详细信息
      const profileResponse = await fetch(`/api/users/${user.id}`, { headers })
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData)
        setEditForm({
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        })
      }

      // 获取用户统计信息
      const statsResponse = await fetch(`/api/users/${user.id}/stats`, { headers })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // 获取用户照片
      const photosResponse = await fetch(`/api/users/${user.id}/photos`, { headers })
      if (photosResponse.ok) {
        const photosData = await photosResponse.json()
        setPhotos(photosData)
      }

    } catch (error) {
      console.error('加载用户资料失败:', error)
      toast.error('加载用户资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新用户资料
  const updateProfile = async () => {
    if (!isAuthenticated || !user) return

    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        toast.error('请先登录')
        return
      }

      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        toast.success('资料更新成功')
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新资料失败:', error)
      toast.error('更新资料失败')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            请先登录
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            登录后查看您的个人资料
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            个人资料
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
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
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {profile?.role === 'admin' ? '管理员' : '用户'}
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
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <PhotoIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_photos}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">作品数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <HeartIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_likes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">获赞数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <EyeIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_views}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">浏览量</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <StarIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_favorites}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">收藏数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <TrophyIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                #{stats.rank}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">排名</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <FireIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.average_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">平均评分</div>
            </div>
          </div>
        )}

        {/* Photos Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              我的作品 ({photos.length})
            </h3>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                还没有上传任何作品
              </p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                上传第一张照片
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer"
                  onClick={() => window.location.href = `/photos/${photo.id}`}
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {photo.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <HeartIcon className="w-4 h-4 mr-1" />
                          <span>{photo.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          <span>{photo.views}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FireIcon className="w-4 h-4 mr-1" />
                        <span>{photo.heat_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
