'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-6">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">SocialConnect</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with friends, share your thoughts, and discover amazing content. 
            Join our community and start building meaningful connections today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Share Your Story</h3>
            <p className="text-gray-600 mb-6">
              Create posts with text and images. Share your thoughts, ask questions, 
              or make announcements with our easy-to-use interface.
            </p>
            <div className="text-3xl">📝</div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Connect & Engage</h3>
            <p className="text-gray-600 mb-6">
              Follow other users, like posts, and leave comments. Build your network 
              and engage with content that matters to you.
            </p>
            <div className="text-3xl">🤝</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-lg text-gray-700">
            Ready to get started?
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
            >
              Create Account
            </a>
            <a
              href="/login"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
