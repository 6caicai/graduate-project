'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenManager } from '@/lib/api'

export default function ClearAuthPage() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  const clearAuth = () => {
    try {
      // 清除认证缓存
      TokenManager.removeToken()
      
      // 清除所有localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      setMessage('✅ 认证缓存已清除！请重新登录。')
      
      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
      
    } catch (error) {
      setMessage(`❌ 清除失败: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          清除认证缓存
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            如果您遇到401认证错误，请点击下面的按钮清除认证缓存，然后重新登录。
          </p>
          
          <button
            onClick={clearAuth}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            清除认证缓存
          </button>
          
          {message && (
            <div className={`p-3 rounded-lg text-center ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              直接跳转到登录页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
