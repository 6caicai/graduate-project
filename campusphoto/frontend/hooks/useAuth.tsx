'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import CampusPhotoApi, { TokenManager } from '@/lib/api'
import type { User, LoginCredentials, UserCreate, Token } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: UserCreate) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()

  // 获取当前用户信息
  const { data: currentUser, isLoading: userLoading } = useQuery(
    'currentUser',
    CampusPhotoApi.getCurrentUser,
    {
      enabled: false, // 禁用自动查询，手动控制
      retry: false,
      onSuccess: (data) => {
        setUser(data)
      },
      onError: () => {
        // 如果获取用户信息失败，清除token
        TokenManager.removeToken()
        setUser(null)
      },
    }
  )

  // 登录
  const loginMutation = useMutation(CampusPhotoApi.login, {
    onSuccess: (data: Token) => {
      setUser(data.user)
      queryClient.setQueryData('currentUser', data.user)
      toast.success('登录成功！')
      router.push('/dashboard')
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.detail || error.message || '登录失败'
      toast.error(typeof errorMessage === 'string' ? errorMessage : '登录失败，请重试')
    },
  })

  // 注册
  const registerMutation = useMutation(CampusPhotoApi.register, {
    onSuccess: () => {
      toast.success('注册成功！请登录')
      router.push('/auth/login')
    },
    onError: (error: any) => {
      console.error('Register error:', error)
      const errorMessage = error.response?.data?.detail || error.message || '注册失败'
      toast.error(typeof errorMessage === 'string' ? errorMessage : '注册失败，请重试')
    },
  })

  // 登出
  const logoutMutation = useMutation(CampusPhotoApi.logout, {
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
      toast.success('已退出登录')
      router.push('/')
    },
    onError: () => {
      // 即使后端返回错误，也要清除本地数据
      setUser(null)
      queryClient.clear()
      TokenManager.removeToken()
      router.push('/')
    },
  })

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const storedUser = TokenManager.getUser()
    const token = TokenManager.getToken()
    
    if (storedUser && token) {
      setUser(storedUser)
    }
    
    // 延迟设置loading为false，确保组件有时间渲染
    setTimeout(() => {
      setIsLoading(false)
    }, 100)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials)
  }

  const register = async (userData: UserCreate) => {
    await registerMutation.mutateAsync(userData)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    queryClient.setQueryData('currentUser', updatedUser)
    TokenManager.setUser(updatedUser)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 路由保护Hook
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  return { user, isLoading }
}

// 角色检查Hook
export function useRequireRole(allowedRoles: string[], redirectTo = '/') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push(redirectTo)
      toast.error('权限不足')
    }
  }, [user, isLoading, router, redirectTo, allowedRoles])

  return { user, isLoading, hasAccess: user && allowedRoles.includes(user.role) }
}



