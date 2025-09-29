'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export default function AdminTestPage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    console.log('Admin Test Page - User:', user)
    console.log('Admin Test Page - Loading:', isLoading)
  }, [user, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Admin 测试页面
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          
          {user ? (
            <div className="space-y-2">
              <p><strong>用户名:</strong> {user.username}</p>
              <p><strong>邮箱:</strong> {user.email}</p>
              <p><strong>角色:</strong> {user.role}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>是否激活:</strong> {user.is_active ? '是' : '否'}</p>
              
              {user.role === 'admin' ? (
                <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ 您有管理员权限，可以访问管理功能
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-800 dark:text-red-200">
                    ❌ 您没有管理员权限
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                ⚠️ 未登录或用户信息加载失败
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <a 
            href="/admin/photos" 
            className="inline-block px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            访问照片管理页面
          </a>
        </div>
      </div>
    </div>
  )
}
