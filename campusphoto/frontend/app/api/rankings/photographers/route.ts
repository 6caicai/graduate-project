import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    const limit = searchParams.get('limit') || '20'
    
    // 代理请求到后端API
    const backendUrl = `http://localhost:8000/api/rankings/photographers?period=${period}&limit=${limit}`
    
    const response = await fetch(backendUrl)
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photographer rankings' },
      { status: 500 }
    )
  }
}
