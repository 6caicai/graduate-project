import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const authHeader = request.headers.get('authorization')

    const backendUrl = `http://localhost:8000/api/appointments/${appointmentId}`
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
      return NextResponse.json({ error: '获取预约详情失败' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    const backendUrl = `http://localhost:8000/api/appointments/${appointmentId}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      return NextResponse.json({ error: '更新预约失败' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
