'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TestAnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const analyzeImage = async () => {
    if (!file) {
      toast.error('请选择文件')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/photos/analyze-for-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('campusphoto_token')}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '分析失败')
      }
      
      const data = await response.json()
      setResult(data)
      toast.success('分析成功')
    } catch (error) {
      console.error('分析失败:', error)
      toast.error(error instanceof Error ? error.message : '分析失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          图片分析测试
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择图片文件
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-pink-50 file:text-pink-700
                hover:file:bg-pink-100
                dark:file:bg-pink-900/20 dark:file:text-pink-400"
            />
          </div>
          
          <button
            onClick={analyzeImage}
            disabled={!file || loading}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '分析中...' : '开始分析'}
          </button>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              分析结果
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            使用说明
          </h3>
          <p className="text-blue-800 dark:text-blue-400 text-sm">
            1. 请先登录系统（使用 admin/admin123）
            <br />
            2. 选择一张图片文件
            <br />
            3. 点击"开始分析"按钮
            <br />
            4. 查看分析结果
          </p>
        </div>
      </div>
    </div>
  )
}
