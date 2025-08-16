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
    return jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string; email: string; role: string; username: string }
  } catch (error) {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const currentUser = verifyToken(authHeader)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { post_id } = await params
    const { content } = await request.json()

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Comment must be 200 characters or less' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if post exists and is active
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, is_active, comment_count')
      .eq('id', post_id)
      .single()

    if (!post || !post.is_active) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content: content.trim(),
        author_id: currentUser.user_id,
        post_id,
        is_active: true
      })
      .select(`
        *,
        author:users!comments_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Update post comment count
    await supabase
      .from('posts')
      .update({ comment_count: post.comment_count + 1 })
      .eq('id', post_id)

    // Create notification (only if not commenting on own post)
    if (currentUser.user_id !== post.author_id) {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: post.author_id,
          sender_id: currentUser.user_id,
          notification_type: 'comment',
          post_id,
          message: `@${currentUser.username} commented on your post`
      })
    }

    return NextResponse.json({
      success: true,
      data: comment
    })

  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single()

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get total count
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id)
      .eq('is_active', true)

    // Get comments with pagination
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('post_id', post_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages
      }
    })

  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 