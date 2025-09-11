'use client'

import { useState, useEffect } from 'react'
import { CampusPhotoApi } from '@/lib/api'

export default function TestApiPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true)
        console.log('开始调用API...')
        const response = await CampusPhotoApi.getPhotos()
        console.log('API响应:', response)
        setData(response)
        setError(null)
      } catch (err) {
        console.error('API调用失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">测试API调用中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          API测试页面
        </h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
            <strong>错误:</strong> {error}
          </div>
        )}

        {data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              API响应数据
            </h2>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>总数量:</strong> {data.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>当前页:</strong> {data.page}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>每页大小:</strong> {data.size}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>图片数量:</strong> {data.items?.length || 0}
              </p>
            </div>
            
            {data.items && data.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  图片列表
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.items.slice(0, 6).map((photo: any) => (
                    <div key={photo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                        {photo.image_url ? (
                          <img
                            src={photo.image_url.startsWith('http') ? photo.image_url : `http://localhost:8000${photo.image_url}`}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            无图片
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {photo.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {photo.theme} - {photo.confidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
