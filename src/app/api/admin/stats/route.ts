import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

// Helper function to verify JWT token and check admin role
function verifyAdminToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string; email: string; role: string }
    if (decoded.role !== 'admin') {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const adminUser = verifyAdminToken(authHeader)

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Get total counts
    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: totalComments },
      { count: totalLikes }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true })
    ])

    // Get today's counts
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const [
      { count: usersToday },
      { count: postsToday },
      { count: commentsToday },
      { count: likesToday }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('comments').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('likes').select('*', { count: 'exact', head: true }).gte('created_at', todayISO)
    ])

    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', sevenDaysAgoISO)

    const stats = {
      total: {
        users: totalUsers || 0,
        posts: totalPosts || 0,
        comments: totalComments || 0,
        likes: totalLikes || 0
      },
      today: {
        users: usersToday || 0,
        posts: postsToday || 0,
        comments: commentsToday || 0,
        likes: likesToday || 0
      },
      active_users: activeUsers || 0
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 