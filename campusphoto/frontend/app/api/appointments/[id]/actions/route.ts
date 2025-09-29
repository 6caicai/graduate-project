import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // accept, reject, complete, cancel, rate
    const authHeader = request.headers.get('authorization')

    let backendUrl = `http://localhost:8000/api/appointments/${appointmentId}`
    
    // 根据action确定API端点
    switch (action) {
      case 'accept':
        backendUrl += '/accept'
        break
      case 'reject':
        backendUrl += '/reject'
        break
      case 'complete':
        backendUrl += '/complete'
        break
      case 'cancel':
        backendUrl += '/cancel'
        break
      case 'rate':
        backendUrl += '/rate'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // 对于rate action，需要从query参数获取rating
    let body = null
    if (action === 'rate') {
      const rating = searchParams.get('rating')
      const review = searchParams.get('review')
      if (!rating) {
        return NextResponse.json({ error: 'Rating is required' }, { status: 400 })
      }
      backendUrl += `?rating=${rating}`
      if (review) {
        backendUrl += `&review=${encodeURIComponent(review)}`
      }
    } else {
      // 对于其他action，尝试获取body
      try {
        body = await request.json()
      } catch {
        // 如果没有body，使用空对象
        body = {}
      }
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      return NextResponse.json({ error: '操作失败' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
