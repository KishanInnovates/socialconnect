# SocialConnect - Social Media Platform

A comprehensive social media backend application built with Next.js, TypeScript, and Supabase. SocialConnect allows users to share posts, connect with others, and discover content through a personalized feed experience.

## 🚀 Features

### Core Functionality

- **User Authentication**: JWT-based authentication with login/register/logout
- **User Profiles**: Basic profiles with bio, avatar, follower/following counts
- **Content Creation**: Text posts with single image upload capability
- **Social Interactions**: Follow/unfollow users, like posts, basic comment system
- **Personalized Feed**: Chronological feed showing posts from followed user
- **Admin Panel**: User management and content oversight

### User Roles & Permissions

- **User (Default)**: Create posts, follow users, like/comment, view feeds
- **Admin**: All user permissions plus user management, content oversight, and statistics

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT with bcryptjs
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel



The application uses the following main tables:

- **users**: User accounts and authentication
- **user_profiles**: Extended user profile information
- **posts**: User-generated content
- **follows**: User follow relationships
- **likes**: Post likes
- **comments**: Post comments
- **notifications**: Real-time notifications
- **refresh_tokens**: JWT refresh token management

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Posts

- `GET /api/posts` - List all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/{id}` - Get specific post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Feed

- `GET /api/feed` - Personalized user feed

### Social Features

- `POST /api/users/{id}/follow` - Follow user
- `DELETE /api/users/{id}/follow` - Unfollow user
- `POST /api/posts/{id}/like` - Like post
- `DELETE /api/posts/{id}/like` - Unlike post
- `POST /api/posts/{id}/comments` - Add comment
- `GET /api/posts/{id}/comments` - Get comments

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-all-read` - Mark all as read

### Admin (Admin only)

- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Platform statistics


## Live : https://socialconnect-three.vercel.app/

