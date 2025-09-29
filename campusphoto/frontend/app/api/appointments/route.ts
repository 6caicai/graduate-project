import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const size = searchParams.get('size') || '20'
    const status_filter = searchParams.get('status_filter')
    const role_filter = searchParams.get('role_filter')
    const authHeader = request.headers.get('authorization')

    const params = new URLSearchParams({
      page,
      size
    })

    if (status_filter) params.append('status_filter', status_filter)
    if (role_filter) params.append('role_filter', role_filter)

    const backendUrl = `http://localhost:8000/api/appointments?${params.toString()}`
    const headers: HeadersInit = {}
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      return NextResponse.json({ error: '获取预约列表失败' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    const backendUrl = 'http://localhost:8000/api/appointments'
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      return NextResponse.json({ error: '创建预约失败' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
