'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Post as PostType } from '@/types/database'
import CreatePost from '@/components/posts/CreatePost'
import Post from '@/components/posts/Post'
import Navigation from '@/components/layout/Navigation'
import { useRouter } from 'next/navigation'

export default function FeedPage() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      fetchFeed()
    }
  }, [user, authLoading, router])

  const fetchFeed = async (pageNum = 1) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/feed?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feed')
      }

      const data = await response.json()
      
      if (pageNum === 1) {
        setPosts(data.data)
      } else {
        setPosts(prev => [...prev, ...data.data])
      }
      
      setHasMore(data.pagination.page < data.pagination.total_pages)
      setPage(pageNum)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch feed')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchFeed(page + 1)
    }
  }

  const handlePostCreated = () => {
    // Refresh feed to show new post
    fetchFeed(1)
  }

  const handlePostUpdated = () => {
    // Refresh feed to show updated post data
    fetchFeed(1)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
          <p className="text-gray-600">Stay updated with posts from people you follow</p>
        </div>

        <CreatePost onPostCreated={handlePostCreated} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && page === 1 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post 
                key={post.id} 
                post={post} 
                onPostUpdated={handlePostUpdated}
              />
            ))}
            
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="text-center text-gray-500 py-8">
                You&apos;ve reached the end of your feed
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <p className="text-lg">No posts yet</p>
                  <p className="text-sm">Follow some users to see their posts in your feed</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 