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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = verifyToken(authHeader)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, image_url, category = 'general' } = await request.json()

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    if (content.length > 280) {
      return NextResponse.json(
        { success: false, error: 'Content must be 280 characters or less' },
        { status: 400 }
      )
    }

    if (!['general', 'announcement', 'question'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content: content.trim(),
        author_id: user.user_id,
        image_url: image_url || null,
        category,
        is_active: true,
        like_count: 0,
        comment_count: 0
      })
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          username,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post
    })

  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const author_id = searchParams.get('author_id')

    const supabase = createAdminClient()

    let query = supabase
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
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    // Get total count
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get posts with pagination
    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

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
    console.error('Get posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 