'use client'

interface AnalysisData {
  theme: string
  confidence: number
  dominant_colors?: Array<{
    name: string
    percentage: number
    hex?: string
  }>
  quality_score?: number
  composition?: {
    aspect_ratio: number
    golden_ratio_score?: number
    symmetry_score?: number
  }
  tags?: string[]
  dimensions?: {
    width: number
    height: number
  }
}

interface AnalysisDisplayProps {
  analysis: AnalysisData
  className?: string
}

export function AnalysisDisplay({ analysis, className = '' }: AnalysisDisplayProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ✨ 智能分析结果
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">📷 主题分类</h4>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {analysis.theme}
          </span>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            置信度: {Math.round(analysis.confidence * 100)}%
          </span>
        </div>

        {analysis.quality_score && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">📊 图像质量</h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              质量评分: {Math.round(analysis.quality_score * 100)}%
            </span>
          </div>
        )}

        {analysis.dominant_colors && analysis.dominant_colors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">🎨 主色调</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.dominant_colors.slice(0, 3).map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  {color.hex && (
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color.hex }}
                    />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {color.name} ({Math.round(color.percentage * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.tags && analysis.tags.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">🏷️ 智能标签</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-md text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.composition && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">👁️ 构图分析</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">长宽比</span>
                <span className="text-gray-900 dark:text-white">
                  {analysis.composition.aspect_ratio.toFixed(2)}:1
                </span>
              </div>
              {analysis.composition.golden_ratio_score && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">黄金分割</span>
                  <span className="text-gray-900 dark:text-white">
                    {Math.round(analysis.composition.golden_ratio_score * 100)}%
                  </span>
                </div>
              )}
              {analysis.composition.symmetry_score && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">对称性</span>
                  <span className="text-gray-900 dark:text-white">
                    {Math.round(analysis.composition.symmetry_score * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {analysis.dimensions && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">📐 图像信息</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              分辨率: {analysis.dimensions.width} × {analysis.dimensions.height}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}