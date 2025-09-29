import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const authHeader = request.headers.get('authorization')

    let backendUrl: string
    const headers: HeadersInit = {}
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // 如果是获取摄影师列表，使用专门的摄影师API
    if (role === 'photographer') {
      backendUrl = 'http://localhost:8000/api/users/photographers'
    } else {
      // 其他情况使用通用用户列表API（需要管理员权限）
      const page = searchParams.get('page') || '1'
      const size = searchParams.get('size') || '20'
      const params = new URLSearchParams({ page, size })
      if (role) params.append('role', role)
      backendUrl = `http://localhost:8000/api/users?${params.toString()}`
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      return NextResponse.json({ error: '获取用户列表失败' }, { status: response.status })
    }

    const data = await response.json()
    
    // 如果是摄影师列表，包装成分页格式
    if (role === 'photographer') {
      return NextResponse.json({
        items: data,
        total: data.length,
        page: 1,
        size: data.length,
        pages: 1
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
