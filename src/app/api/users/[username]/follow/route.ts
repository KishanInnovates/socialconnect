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
  { params }: { params: Promise<{ username: string }> }
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

    const { username } = await params

    const supabase = createAdminClient()

    // Get user by username
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, is_active')
      .eq('username', username)
      .single()

    if (!targetUser || !targetUser.is_active) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (currentUser.user_id === targetUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.user_id)
      .eq('following_id', targetUser.id)
      .single()

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Create follow relationship
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUser.user_id,
        following_id: targetUser.id
      })

    if (error) {
      console.error('Error creating follow:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to follow user' },
        { status: 500 }
      )
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        recipient_id: targetUser.id,
        sender_id: currentUser.user_id,
        notification_type: 'follow',
        message: `@${currentUser.username} started following you`
      })

    return NextResponse.json({
      success: true,
      message: 'User followed successfully'
    })

  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
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

    const { username } = await params

    const supabase = createAdminClient()

    // Get user by username
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete follow relationship
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.user_id)
      .eq('following_id', targetUser.id)

    if (error) {
      console.error('Error unfollowing:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to unfollow user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User unfollowed successfully'
    })

  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 