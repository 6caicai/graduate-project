import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const size = searchParams.get('size') || '20'
    const statusFilter = searchParams.get('status_filter')
    const search = searchParams.get('search')
    
    // 获取Authorization头
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }
    
    // 构建后端API URL
    const params = new URLSearchParams({
      page,
      size
    })
    
    if (statusFilter) {
      params.append('status_filter', statusFilter)
    }
    
    if (search) {
      params.append('search', search)
    }
    
    const backendUrl = `http://localhost:8000/api/admin/photos?${params}`
    
    // 代理请求到后端API
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Admin photos API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin photos' },
      { status: 500 }
    )
  }
}
