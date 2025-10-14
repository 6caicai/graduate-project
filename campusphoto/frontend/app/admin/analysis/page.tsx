'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminAnalysisPage() {
  const { user, loading, token } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState(null)

  const loadAnalysisStats = async () => {
    try {
      setLoadingStats(true)
      setError(null)
      
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('http://localhost:8000/api/admin/analysis', {
        headers
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取分析数据失败')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('加载分析数据失败:', err)
      setError(err instanceof Error ? err.message : '加载分析数据失败')
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }
    
    if (user && user.role !== 'admin') {
      router.push('/')
      return
    }

    if (user && user.role === 'admin') {
      loadAnalysisStats()
    }
  }, [user, loading, router])

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadAnalysisStats}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          智能分析中心
        </h1>
        
        {stats ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              分析统计
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total_photos || 0}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">总照片数</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.analyzed_photos || 0}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">已分析照片</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {(stats.analysis_accuracy || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">分析准确率</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {(stats.quality_stats?.average_quality || 0).toFixed(1)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">平均质量</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
          </div>
        )}
      </div>
    </div>
  )
}