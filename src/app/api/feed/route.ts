import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

// Helper function to verify JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string; email: string; role: string }
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = verifyToken(authHeader)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()

    // Get users that the current user follows
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.user_id)

    const followingIds = following?.map(f => f.following_id) || []
    followingIds.push(user.user_id) // Include own posts

    // Get posts from followed users and self
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          username,
          first_name,
          last_name
        )
      `)
      .in('author_id', followingIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching feed:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch feed' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .in('author_id', followingIds)
      .eq('is_active', true)

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    // Check if current user liked each post
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id)
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.user_id)
        .in('post_id', postIds)

      const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
      
      posts.forEach(post => {
        post.is_liked = likedPostIds.has(post.id)
      })
    }

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages
      }
    })

  } catch (error) {
    console.error('Get feed error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 