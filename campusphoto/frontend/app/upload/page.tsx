'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import CampusPhotoApi from '@/lib/api'
import { AnalysisDisplay } from '@/components/ui/AnalysisDisplay'
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface UploadFormData {
  title: string
  description: string
  location: string
  tags: string[]
  isPublic: boolean
  allowComments: boolean
  allowLikes: boolean
  theme: string
}

interface AnalysisResult {
  recommended_theme: string
  confidence: number
  available_themes: string[]
  smart_tags: string[]
  analysis_details: {
    dominant_colors: any[]
    quality_score: number
    composition: any
  }
}

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // 检查用户权限
  useEffect(() => {
    if (user && user.role === 'student') {
      // 学生用户重定向到首页
      router.push('/')
      return
    }
  }, [user, router])

  // 如果用户是学生，不渲染页面内容
  if (user && user.role === 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            访问受限
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            学生用户没有上传作品的权限
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    location: '',
    tags: [],
    isPublic: true,
    allowComments: true,
    allowLikes: true,
    theme: ''
  })
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [availableThemes, setAvailableThemes] = useState<string[]>([])
  
  // 智能分析图片
  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
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
        throw new Error('分析失败')
      }
      
      const result: AnalysisResult = await response.json()
      setAnalysisResult(result)
      
      // 设置推荐的主题
      setFormData(prev => ({
        ...prev,
        theme: result.recommended_theme
      }))
      
      // 设置可选项
      setAvailableThemes(result.available_themes)
      
      toast.success('智能分析完成！')
    } catch (error) {
      console.error('分析失败:', error)
      toast.error('图片分析失败，请手动选择分类')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // 当主题改变时更新表单
  const handleThemeChange = (theme: string) => {
    setFormData(prev => ({ ...prev, theme }))
  }
  
  // 如果用户未登录，显示登录提示
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            请先登录
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您需要登录后才能上传作品
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            前往登录
          </a>
        </div>
      </div>
    )
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length !== files.length) {
      toast.error('请只上传图片文件')
    }
    
    if (imageFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...imageFiles].slice(0, 10) // 最多10张
      setUploadedFiles(newFiles)
      
      // 创建预览URL
      const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, 10))
      
      // 如果这是第一张图片，进行智能分析
      if (uploadedFiles.length === 0 && imageFiles.length > 0) {
        analyzeImage(imageFiles[0])
      }
      
      toast.success(`成功添加 ${imageFiles.length} 张图片`)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    setUploadedFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = e.currentTarget.value.trim()
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }))
        e.currentTarget.value = ''
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadedFiles.length === 0) {
      toast.error('请至少上传一张图片')
      return
    }
    
    if (!formData.title.trim()) {
      toast.error('请输入作品标题')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)
      
      // 实际的上传API调用
      const uploadedPhotosResult = await CampusPhotoApi.uploadPhotos(uploadedFiles, formData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // 保存上传结果并显示分析
      setUploadedPhotos(uploadedPhotosResult)
      setShowAnalysis(true)
      
      toast.success(`成功上传 ${uploadedPhotosResult.length} 张作品！`)
      
      // 延迟重置表单，让用户看到分析结果
      setTimeout(() => {
        setUploadedFiles([])
        setPreviewUrls([])
        setFormData({
          title: '',
          description: '',
          location: '',
          tags: [],
          isPublic: true,
          allowComments: true,
          allowLikes: true,
          theme: ''
        })
        setShowAnalysis(false)
        setUploadedPhotos([])
      }, 5000) // 5秒后重置
      
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error.response?.data?.detail || error.message || '上传失败，请重试'
      toast.error(typeof errorMessage === 'string' ? errorMessage : '上传失败，请重试')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            上传作品
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            分享你的摄影作品，让更多人看到你的创作
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 上传区域 */}
          <div className="space-y-6">
            {/* 拖拽上传区域 */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  拖拽图片到这里
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  或点击选择文件
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  支持 JPG、PNG、WebP 格式，最多10张
                </p>
              </div>
            </div>

            {/* 预览区域 */}
            {previewUrls.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  预览 ({previewUrls.length}/10)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 表单区域 */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  基本信息
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      作品标题 *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="给你的作品起个名字"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      作品描述
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="描述你的作品，分享拍摄心得..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      拍摄地点
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="在哪里拍摄的？"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 智能分类推荐 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    智能分类
                  </h3>
                  {isAnalyzing && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      分析中...
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* 智能推荐结果 */}
                  {analysisResult && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          AI智能推荐
                        </span>
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                          (置信度: {Math.round(analysisResult.confidence * 100)}%)
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        推荐分类: <strong>{analysisResult.recommended_theme}</strong>
                      </p>
                      {analysisResult.smart_tags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">智能标签:</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.smart_tags.slice(0, 5).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 主题选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      主题分类 *
                    </label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">请选择主题</option>
                      {availableThemes.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  
                  {/* 重新分析按钮 */}
                  {uploadedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => analyzeImage(uploadedFiles[0])}
                      disabled={isAnalyzing}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAnalyzing ? '分析中...' : '重新分析'}
                    </button>
                  )}
                </div>
              </div>

              {/* 标签 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  标签
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      添加标签
                    </label>
                    <div className="relative">
                      <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        onKeyDown={handleTagInput}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="输入标签后按回车添加"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      按回车或逗号添加标签
                    </p>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 隐私设置 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  隐私设置
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        公开作品
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        其他用户可以查看和互动
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        允许评论
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        其他用户可以评论你的作品
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      name="allowComments"
                      checked={formData.allowComments}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        允许点赞
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        其他用户可以点赞你的作品
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      name="allowLikes"
                      checked={formData.allowLikes}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  选择更多图片
                </button>
                
                <button
                  type="submit"
                  disabled={isUploading || uploadedFiles.length === 0}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      上传中... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                      上传作品
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 智能分析结果 */}
        {showAnalysis && uploadedPhotos.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ✨ 智能分析结果
            </h2>
            <div className="space-y-6">
              {uploadedPhotos.map((photo, index) => (
                <div key={photo.id || index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* 照片和分析结果并排显示 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    {/* 左侧：照片预览 */}
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={previewUrls[index] || '/placeholder-photo.jpg'}
                          alt={`照片 ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg shadow-lg"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                          照片 {index + 1}
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {photo.title || `照片 ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          上传时间: {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* 右侧：分析结果 */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        📊 分析结果
                      </h4>
                      
                      {/* 主题分类 */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">主题分类</span>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            {photo.theme || '未知'}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            置信度: {Math.round((parseFloat(photo.confidence) || 0) * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* 质量评分 */}
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">图像质量</span>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${Math.round((parseFloat(photo.confidence) || 0) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {Math.round((parseFloat(photo.confidence) || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 智能标签 */}
                      <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-white mb-2">智能标签</div>
                        <div className="flex flex-wrap gap-2">
                          {[photo.theme || '校园风光', '高质量', '推荐'].map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 状态指示 */}
                      <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">分析完成</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 总结信息 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🎉 上传完成！
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  已成功上传 {uploadedPhotos.length} 张照片，所有照片都已完成智能分析
                </p>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.href = '/photos'}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    查看作品集
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    继续上传
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
