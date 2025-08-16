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

    const supabase = createAdminClient()

    // Check if post exists and is active
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, is_active, like_count')
      .eq('id', post_id)
      .single()

    if (!post || !post.is_active) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', currentUser.user_id)
      .eq('post_id', post_id)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Post already liked' },
        { status: 400 }
      )
    }

    // Create like
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        user_id: currentUser.user_id,
        post_id
      })

    if (likeError) {
      console.error('Error creating like:', likeError)
      return NextResponse.json(
        { success: false, error: 'Failed to like post' },
        { status: 500 }
      )
    }

    // Update post like count
    const { error: updateError } = await supabase
      .from('posts')
      .update({ like_count: post.like_count + 1 })
      .eq('id', post_id)

    if (updateError) {
      console.error('Error updating like count:', updateError)
    }

    // Create notification (only if not liking own post)
    if (currentUser.user_id !== post.author_id) {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: post.author_id,
          sender_id: currentUser.user_id,
          notification_type: 'like',
          post_id,
          message: `@${currentUser.username} liked your post`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Post liked successfully'
    })

  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const supabase = createAdminClient()

    // Get current like count
    const { data: post } = await supabase
      .from('posts')
      .select('like_count')
      .eq('id', post_id)
      .single()

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', currentUser.user_id)
      .eq('post_id', post_id)

    if (error) {
      console.error('Error removing like:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to unlike post' },
        { status: 500 }
      )
    }

    // Update post like count
    await supabase
      .from('posts')
      .update({ like_count: Math.max(0, post.like_count - 1) })
      .eq('id', post_id)

    return NextResponse.json({
      success: true,
      message: 'Post unliked successfully'
    })

  } catch (error) {
    console.error('Unlike error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 