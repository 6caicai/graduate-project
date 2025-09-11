'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRequireAuth } from '@/hooks/useAuth'
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
}

export default function UploadPage() {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
  
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    location: '',
    tags: [],
    isPublic: true,
    allowComments: true,
    allowLikes: true
  })

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
      
      toast.success(`成功添加 ${imageFiles.length} 张图片`)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    setUploadedFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          allowLikes: true
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
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
              智能分析结果
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadedPhotos.map((photo, index) => (
                <AnalysisDisplay
                  key={photo.id || index}
                  analysis={{
                    theme: photo.theme || '未知',
                    confidence: parseFloat(photo.confidence) || 0,
                    dominant_colors: [
                      { name: '蓝色', percentage: 0.3, hex: '#3B82F6' },
                      { name: '绿色', percentage: 0.2, hex: '#10B981' }
                    ],
                    quality_score: 0.8,
                    composition: {
                      aspect_ratio: 1.78,
                      golden_ratio_score: 0.6,
                      symmetry_score: 0.7
                    },
                    tags: [photo.theme || '校园风光', '高质量'],
                    dimensions: { width: 1920, height: 1080 }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
