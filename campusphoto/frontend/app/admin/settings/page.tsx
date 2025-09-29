'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  Cog6ToothIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

interface SystemConfig {
  key: string
  value: any
  description: string
  category: string
}

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modifiedConfigs, setModifiedConfigs] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/auth/login')
    } else if (isAuthenticated && user?.role !== 'admin') {
      toast.error('无权限访问此页面')
      router.push('/')
    } else if (isAuthenticated && user?.role === 'admin') {
      loadSystemConfigs()
    }
  }, [authLoading, isAuthenticated, user])

  const loadSystemConfigs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch('/api/admin/configurations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取系统配置失败')
      }

      const data = await response.json()
      setConfigs(data.items || [])
    } catch (err: any) {
      console.error('加载系统配置失败:', err)
      toast.error(err.message)
      // 设置默认配置
      setConfigs([
        {
          key: 'max_file_size',
          value: { value: 10485760, enabled: true },
          description: '最大文件大小(字节)',
          category: 'upload'
        },
        {
          key: 'allowed_extensions',
          value: { value: ['jpg', 'jpeg', 'png', 'webp'], enabled: true },
          description: '允许的文件扩展名',
          category: 'upload'
        },
        {
          key: 'ranking_weights',
          value: { like: 1.0, favorite: 2.0, vote: 3.0, view: 0.5, time_decay: 0.9 },
          description: '排行榜权重配置',
          category: 'ranking'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    setModifiedConfigs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveConfigs = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('campusphoto_token')
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const updates = Object.entries(modifiedConfigs).map(([key, value]) => ({
        key,
        value
      }))

      const response = await fetch('/api/admin/configurations', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configurations: updates }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存配置失败')
      }

      toast.success('配置保存成功')
      setModifiedConfigs({})
      loadSystemConfigs() // 重新加载配置
    } catch (err: any) {
      console.error('保存配置失败:', err)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const renderConfigInput = (config: SystemConfig) => {
    const currentValue = modifiedConfigs[config.key] !== undefined ? modifiedConfigs[config.key] : config.value

    switch (config.key) {
      case 'max_file_size':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={currentValue.value || 0}
              onChange={(e) => handleConfigChange(config.key, { ...currentValue, value: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={currentValue.enabled || false}
                onChange={(e) => handleConfigChange(config.key, { ...currentValue, enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">启用此限制</span>
            </div>
          </div>
        )

      case 'allowed_extensions':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {currentValue.value?.map((ext: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                >
                  {ext}
                </span>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={currentValue.enabled || false}
                onChange={(e) => handleConfigChange(config.key, { ...currentValue, enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">启用扩展名限制</span>
            </div>
          </div>
        )

      case 'ranking_weights':
        return (
          <div className="space-y-3">
            {Object.entries(currentValue).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace('_', ' ')}:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={value as number}
                  onChange={(e) => handleConfigChange(config.key, { ...currentValue, [key]: parseFloat(e.target.value) })}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            ))}
          </div>
        )

      default:
        return (
          <textarea
            value={JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleConfigChange(config.key, parsed)
              } catch {
                // 忽略无效JSON
              }
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
        )
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'upload':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'ranking':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'competition':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'general':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'upload':
        return '上传设置'
      case 'ranking':
        return '排行榜设置'
      case 'competition':
        return '比赛设置'
      case 'general':
        return '通用设置'
      default:
        return '其他设置'
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">系统设置</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">管理系统配置和参数</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={loadSystemConfigs}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
              刷新
            </button>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              返回仪表板
            </Link>
          </div>
        </div>

        {/* Save Button */}
        {Object.keys(modifiedConfigs).length > 0 && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  您有 {Object.keys(modifiedConfigs).length} 项配置未保存
                </span>
              </div>
              <button
                onClick={handleSaveConfigs}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        )}

        {/* Configurations */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载配置中...</span>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Cog6ToothIcon className="w-16 h-16 mx-auto mb-4" />
              <p>暂无系统配置</p>
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {config.key}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(config.category)}`}>
                        {getCategoryText(config.category)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {config.description}
                    </p>
                  </div>
                  {modifiedConfigs[config.key] !== undefined && (
                    <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                      <span className="text-sm">已修改</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {renderConfigInput(config)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
