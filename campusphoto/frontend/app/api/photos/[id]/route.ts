import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id
    
    // 代理请求到后端API
    const backendUrl = `http://localhost:8000/api/photos/${photoId}`
    
    const response = await fetch(backendUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: '照片不存在' }, { status: 404 })
      }
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photo details' },
      { status: 500 }
    )
  }
}
