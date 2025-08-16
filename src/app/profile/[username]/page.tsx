'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile, Post as PostType } from '@/types/database'
import Navigation from '@/components/layout/Navigation'
import Post from '@/components/posts/Post'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const { user } = useAuth()
  const params = useParams()
  const username = params.username as string

  useEffect(() => {
    if (username) {
      fetchProfile()
      fetchPosts()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        setIsFollowing(data.data.is_following || false)
      } else {
        setError('Profile not found')
      }
    } catch (error) {
      setError('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?author_id=${username}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const handleFollow = async () => {
    if (!user || !profile) return

    try {
      const token = localStorage.getItem('access_token')
      const method = isFollowing ? 'DELETE' : 'POST'
      
      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        // Refresh profile to update follower count
        fetchProfile()
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="text-center text-red-600">{error || 'Profile not found'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-2xl font-semibold">
                  {profile.first_name[0]}{profile.last_name[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profile.posts_count}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profile.followers_count}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profile.following_count}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>

          {/* Follow Button */}
          {user && user.id !== profile.id && (
            <div className="text-center">
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Post 
                key={post.id} 
                post={post} 
                onPostUpdated={fetchPosts}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No posts yet</p>
              <p className="text-sm">When {profile.first_name} creates posts, they&apos;ll appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 