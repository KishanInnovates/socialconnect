'use client'

import React, { useState } from 'react'
import { Post as PostType, Comment } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'

interface PostProps {
  post: PostType
  onPostUpdated: () => void
}

export default function Post({ post, onPostUpdated }: PostProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const { user } = useAuth()

  const handleLike = async () => {
    if (!user) return

    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const method = post.is_liked ? 'DELETE' : 'POST'
      
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        onPostUpdated()
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentContent.trim()) return

    setCommentLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      })

      if (response.ok) {
        setCommentContent('')
        onPostUpdated()
        // Refresh comments
        fetchComments()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const toggleComments = () => {
    if (!showComments) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {post.author.avatar_url ? (
                <img 
                  src={post.author.avatar_url} 
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold">
                  {post.author.first_name[0]}{post.author.last_name[0]}
                </span>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {post.author.first_name} {post.author.last_name}
              </div>
              <div className="text-sm text-gray-500">
                @{post.author.username} • {formatDate(post.created_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
              {post.category}
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-900 mb-4">{post.content}</p>
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post image" 
            className="w-full rounded-lg mb-4"
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 ${
                post.is_liked ? 'text-red-500' : 'text-gray-500'
              } hover:text-red-500 transition-colors`}
            >
              <Heart size={20} fill={post.is_liked ? 'currentColor' : 'none'} />
              <span>{post.like_count}</span>
            </button>
            
            <button
              onClick={toggleComments}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span>{post.comment_count}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 p-4">
          {/* Add Comment */}
          {user && (
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 text-black placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentContent.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {commentLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {comment.author.avatar_url ? (
                    <img 
                      src={comment.author.avatar_url} 
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-semibold">
                      {comment.author.first_name[0]}{comment.author.last_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author.first_name} {comment.author.last_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        @{comment.author.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 