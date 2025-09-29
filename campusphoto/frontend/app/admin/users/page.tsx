'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'

interface User {
  id: number
  username: string
  email: string
  role: string
  bio: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

interface PaginatedResponse {
  items: User[]
  total: number
  page: number
  size: number
  pages: number
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const usersPerPage = 20

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/auth/login')
    } else if (isAuthenticated && user?.role !== 'admin') {
      toast.error('无权限访问此页面')
      router.push('/')
    } else if (isAuthenticated && user?.role === 'admin') {
      loadUsers()
    }
  }, [authLoading, isAuthenticated, user, currentPage, roleFilter, searchQuery])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: usersPerPage.toString(),
      })

      if (roleFilter !== 'all') {
        params.append('role', roleFilter)
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取用户列表失败')
      }

      const data: PaginatedResponse = await response.json()
      setUsers(data.items)
      setTotalPages(data.pages)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
      setUsers([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role)
    setCurrentPage(1)
  }

  const handleDeactivateUser = async (userId: number) => {
    if (!window.confirm('确定要停用此用户吗？')) {
      return
    }

    try {
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch(`http://localhost:8000/api/users/${userId}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '停用用户失败')
      }

      toast.success('用户已停用')
      loadUsers() // 重新加载用户列表
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'photographer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员'
      case 'photographer':
        return '摄影师'
      case 'student':
        return '学生'
      default:
        return '未知'
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">用户管理</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">管理系统中的所有用户</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
            返回仪表板
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索用户名或邮箱..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </form>

            {/* Role Filter */}
            <div className="flex space-x-2">
              {['all', 'admin', 'photographer', 'student'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleFilterChange(role)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    roleFilter === role
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {role === 'all' ? '全部' : getRoleText(role)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>加载用户失败: {error}</p>
              <button onClick={loadUsers} className="mt-4 text-pink-600 hover:underline">
                重试
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <UserIcon className="w-16 h-16 mx-auto mb-4" />
              <p>没有找到用户。</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        用户
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        角色
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        注册时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {userItem.avatar_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={userItem.avatar_url}
                                  alt={userItem.username}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {userItem.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userItem.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                            {getRoleText(userItem.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {userItem.is_active ? (
                              <>
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-sm text-green-600 dark:text-green-400">活跃</span>
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-sm text-red-600 dark:text-red-400">停用</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(userItem.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/profile/${userItem.id}`}
                              className="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            {userItem.id !== user?.id && userItem.is_active && (
                              <button
                                onClick={() => handleDeactivateUser(userItem.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6"
                  aria-label="Pagination"
                >
                  <div className="flex flex-1 justify-between sm:justify-end">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                      <ArrowLeftIcon className="h-5 w-5 ml-1 rotate-180" aria-hidden="true" />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
