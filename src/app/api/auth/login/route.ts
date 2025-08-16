import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find user by email or username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get user profile with counts
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        followers:follows!follows_following_id_fkey(count),
        following:follows!follows_follower_id_fkey(count),
        posts:posts(count)
      `)
      .eq('user_id', user.id)
      .single()

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        user_id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Store refresh token
    await supabase
      .from('refresh_tokens')
      .insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    const userProfile = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || null,
      website: profile?.website || null,
      location: profile?.location || null,
      profile_visibility: user.profile_visibility,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      followers_count: profile?.followers?.[0]?.count || 0,
      following_count: profile?.following?.[0]?.count || 0,
      posts_count: profile?.posts?.[0]?.count || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userProfile,
        access_token: accessToken,
        refresh_token: refreshToken
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 