export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  bio?: string
  avatar_url?: string
  website?: string
  location?: string
  profile_visibility: 'public' | 'private' | 'followers_only'
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface UserProfile extends User {
  followers_count: number
  following_count: number
  posts_count: number
  is_following?: boolean
}

export interface Post {
  id: string
  content: string
  author_id: string
  author: UserProfile
  image_url?: string
  category: 'general' | 'announcement' | 'question'
  is_active: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  is_liked?: boolean
}

export interface Comment {
  id: string
  content: string
  author_id: string
  author: UserProfile
  post_id: string
  is_active: boolean
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  follower: UserProfile
  following: UserProfile
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  user: UserProfile
  created_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  sender_id: string
  notification_type: 'follow' | 'like' | 'comment'
  post_id?: string
  message: string
  is_read: boolean
  created_at: string
  sender: UserProfile
  post?: Post
}

export interface AuthResponse {
  user: UserProfile
  access_token: string
  refresh_token: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
} 