# SocialConnect - Social Media Platform

A comprehensive social media backend application built with Next.js, TypeScript, and Supabase. SocialConnect allows users to share posts, connect with others, and discover content through a personalized feed experience.

## 🚀 Features

### Core Functionality

- **User Authentication**: JWT-based authentication with login/register/logout
- **User Profiles**: Basic profiles with bio, avatar, follower/following counts
- **Content Creation**: Text posts with single image upload capability
- **Social Interactions**: Follow/unfollow users, like posts, basic comment system
- **Personalized Feed**: Chronological feed showing posts from followed users
- **Real-time Notifications**: Live notifications using Supabase Real-Time Subscriptions
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
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- PostgreSQL database

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd socialconnect
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**

   - Create a new Supabase project
   - Run the SQL commands from `database-schema.sql` in your Supabase SQL editor
   - This will create all necessary tables and indexes

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

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

## 🎯 Key Features Implementation

### Real-time Notifications

- Uses Supabase Realtime subscriptions
- Automatic notification creation on follow/like/comment actions
- Real-time updates in the frontend

### Personalized Feed

- Shows posts from followed users + own posts
- Chronological ordering (newest first)
- Pagination support (20 posts per page)

### Image Upload

- Support for JPEG/PNG formats
- Maximum file size: 2MB
- Stored in Supabase Storage

### Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy automatically

## 📱 Usage

### Default Admin Account

- **Email**: admin@socialconnect.com
- **Username**: admin
- **Password**: admin123

### User Registration

1. Navigate to `/register`
2. Fill in your details
3. Verify your email (if configured)
4. Sign in at `/login`

### Creating Posts

1. Sign in to your account
2. Navigate to `/feed`
3. Use the "Create Post" form
4. Add text content (max 280 characters)
5. Select category and post

### Following Users

1. Visit a user's profile
2. Click "Follow" button
3. See their posts in your feed

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase key
- `SUPABASE_SERVICE_ROLE_KEY`: Private Supabase key
- `JWT_SECRET`: Secret key for JWT signing
- `NEXT_PUBLIC_APP_URL`: Your application URL

### Database Configuration

- Enable Row Level Security (RLS) in Supabase
- Set up appropriate policies for data access
- Configure storage buckets for image uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/socialconnect/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Advanced search functionality
- [ ] Direct messaging system
- [ ] Post sharing and reposting
- [ ] Advanced privacy controls
- [ ] Mobile app development
- [ ] Analytics dashboard
- [ ] Content moderation tools
- [ ] API rate limiting
- [ ] WebSocket support for real-time chat

## 📊 Performance Considerations

- Database indexes on frequently queried columns
- Pagination for large datasets
- Image optimization and lazy loading
- Efficient query patterns with Supabase
- Client-side state management

## 🔒 Security Considerations

- JWT token expiration and refresh
- Password strength requirements
- Input validation and sanitization
- Role-based access control
- Secure file upload validation
- HTTPS enforcement in production

---

**Built with ❤️ using Next.js and Supabase**
