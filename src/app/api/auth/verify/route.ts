import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret"

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string }
    return NextResponse.json({ user: decoded })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}