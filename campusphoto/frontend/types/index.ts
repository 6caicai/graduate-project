// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  role: 'student' | 'photographer' | 'admin'
  avatar_url?: string
  bio?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface UserProfile extends User {
  photos_count: number
  followers_count: number
  following_count: number
}

export interface UserCreate {
  username: string
  email: string
  password: string
  role: 'student' | 'photographer'
  bio?: string
}

export interface UserUpdate {
  username?: string
  email?: string
  bio?: string
  avatar_url?: string
}

// 认证相关类型
export interface LoginCredentials {
  username: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

// 作品相关类型
export interface Photo {
  id: number
  user_id: number
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  theme?: string
  confidence?: number
  views: number
  likes: number
  favorites: number
  votes: number
  heat_score: number
  competition_id?: number
  is_approved: boolean
  uploaded_at: string
  updated_at?: string
}

export interface PhotoDetail extends Photo {
  user: User
  competition?: Competition
  is_liked: boolean
  is_favorited: boolean
  is_voted: boolean
}

export interface PhotoCreate {
  title: string
  description?: string
  competition_id?: number
}

export interface PhotoUpdate {
  title?: string
  description?: string
}

// 比赛相关类型
export interface Competition {
  id: number
  name: string
  description?: string
  theme?: string
  start_time: string
  end_time: string
  voting_end_time?: string
  status: 'draft' | 'active' | 'voting' | 'closed'
  rules?: Record<string, any>
  prizes?: Record<string, any>
  max_submissions: number
  created_at: string
  updated_at?: string
}

export interface CompetitionDetail extends Competition {
  photos_count: number
  participants_count: number
  photos: Photo[]
}

export interface CompetitionCreate {
  name: string
  description?: string
  theme?: string
  start_time: string
  end_time: string
  voting_end_time?: string
  max_submissions: number
  rules?: Record<string, any>
  prizes?: Record<string, any>
}

// 预约相关类型
export interface Appointment {
  id: number
  student_id: number
  photographer_id: number
  title: string
  description?: string
  preferred_time: string
  actual_time?: string
  location?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  notes?: string
  rating?: number
  review?: string
  created_at: string
  updated_at?: string
}

export interface AppointmentDetail extends Appointment {
  student: User
  photographer: User
}

export interface AppointmentCreate {
  photographer_id: number
  title: string
  description?: string
  preferred_time: string
  location?: string
}

export interface AppointmentUpdate {
  title?: string
  description?: string
  preferred_time?: string
  actual_time?: string
  location?: string
  status?: string
  notes?: string
}

// 交互相关类型
export interface Interaction {
  id: number
  user_id: number
  photo_id: number
  type: 'like' | 'favorite' | 'view' | 'vote'
  created_at: string
}

export interface InteractionCreate {
  photo_id: number
  type: 'like' | 'favorite' | 'view' | 'vote'
}

// 排行榜相关类型
export interface Ranking {
  id: number
  photo_id: number
  rank_type: string
  rank: number
  score: number
  period: string
  calculated_at: string
}

export interface RankingDetail extends Ranking {
  photo: PhotoDetail
}

// 配置相关类型
export interface Configuration {
  id: number
  key: string
  value: Record<string, any>
  description?: string
  category: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// 统计相关类型
export interface Statistics {
  total_users: number
  total_photos: number
  total_competitions: number
  total_appointments: number
  active_competitions: number
  photos_this_month: number
  users_this_month: number
}

// 分页相关类型
export interface PaginationParams {
  page: number
  size: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// API响应类型
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  success?: boolean
  error?: string
}

export interface MessageResponse {
  message: string
  success: boolean
}

// 表单相关类型
export interface FormError {
  field: string
  message: string
}

export interface UploadFile {
  file: File
  preview?: string
}

// 筛选和排序类型
export interface PhotoFilters {
  theme?: string
  competition_id?: number
  user_id?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface CompetitionFilters {
  status?: string
  theme?: string
}

export interface AppointmentFilters {
  status?: string
  role_filter?: string
}

// 主题相关类型
export interface Theme {
  name: string
  count: number
  description?: string
  icon?: string
}

// 通知相关类型
export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
}

// 搜索相关类型
export interface SearchResult {
  photos: Photo[]
  users: User[]
  competitions: Competition[]
  total: number
}

export interface SearchParams {
  query: string
  type?: 'all' | 'photos' | 'users' | 'competitions'
  filters?: Record<string, any>
}

// 分析相关类型
export interface AnalyticsData {
  views: number
  likes: number
  favorites: number
  votes: number
  comments: number
  shares: number
}

export interface TrendingPhoto {
  photo: PhotoDetail
  trend_score: number
  recent_interactions: number
  total_interactions: number
}

export interface UserStatistics {
  basic_stats: {
    total_photos: number
    approved_photos: number
    total_likes: number
    total_favorites: number
    total_views: number
  }
  theme_distribution: Array<{
    theme: string
    count: number
  }>
  popular_photos: Array<{
    id: number
    title: string
    likes: number
    favorites: number
    views: number
    image_url: string
  }>
  upload_trend: Array<{
    date: string
    count: number
  }>
}

// 图像分析类型
export interface ImageAnalysisResult {
  theme: string
  confidence: number
  tags: string[]
  colors: string[]
  quality_score: number
  dimensions: {
    width: number
    height: number
  }
}

// 热度分析配置
export interface HeatScoreConfig {
  like_weight: number
  favorite_weight: number
  vote_weight: number
  view_weight: number
  comment_weight: number
  time_decay_factor: number
}

// 错误类型
export interface ApiError {
  detail: string
  error_code?: string
  status_code: number
}

// 侧边栏菜单项类型
export interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  badge?: number
  children?: MenuItem[]
}

// 模态框类型
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

// 下拉菜单选项类型
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: React.ComponentType<any>
}

// 表格列定义类型
export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
  width?: string | number
}

// 日期范围类型
export interface DateRange {
  start: Date
  end: Date
}

// 导出类型
export type UserRole = 'student' | 'photographer' | 'admin'
export type PhotoStatus = 'pending' | 'approved' | 'rejected'
export type CompetitionStatus = 'draft' | 'active' | 'voting' | 'closed'
export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
export type InteractionType = 'like' | 'favorite' | 'view' | 'vote'
export type SortOrder = 'asc' | 'desc'


