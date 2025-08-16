# SocialConnect Deployment Guide

This guide will help you deploy the SocialConnect application to various platforms.

## 🚀 Prerequisites

Before deploying, ensure you have:

1. **Supabase Project Setup**

   - Created a Supabase project
   - Run the database schema from `database-schema.sql`
   - Configured environment variables

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   NEXT_PUBLIC_APP_URL=your_deployment_url
   ```

## 🌐 Vercel Deployment (Recommended)

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in the Vercel dashboard
5. Deploy

### 3. Environment Variables in Vercel

- Go to your project settings
- Navigate to "Environment Variables"
- Add all required environment variables
- Redeploy if needed

## 🚀 Netlify Deployment

### 1. Build Locally

```bash
npm run build
```

### 2. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `out` folder, or
3. Connect your GitHub repository for automatic deployments

### 3. Environment Variables in Netlify

- Go to Site settings > Environment variables
- Add all required environment variables
- Redeploy if needed

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Build and Run

```bash
# Build image
docker build -t socialconnect .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e JWT_SECRET=your_secret \
  socialconnect
```

## 🔧 Production Configuration

### 1. Update Environment Variables

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Security Headers

Add security headers in `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

### 3. Database Security

- Enable Row Level Security (RLS) in Supabase
- Set up proper database policies
- Use environment-specific database connections

## 📊 Monitoring and Analytics

### 1. Vercel Analytics

- Enable Vercel Analytics in your project
- Monitor performance and user behavior

### 2. Supabase Monitoring

- Use Supabase dashboard for database monitoring
- Set up alerts for critical metrics

### 3. Error Tracking

- Consider adding Sentry or similar error tracking
- Monitor application errors and performance

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database policies configured
- [ ] JWT secrets are strong and unique
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation active
- [ ] File upload restrictions in place

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**

   - Ensure variables are set in deployment platform
   - Check variable names match exactly
   - Redeploy after adding variables

2. **Database Connection Issues**

   - Verify Supabase URL and keys
   - Check database is accessible
   - Ensure RLS policies are correct

3. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed
   - Check Node.js version compatibility

### Debug Commands

```bash
# Check build locally
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Clean build
npm run clean && npm run build
```

## 📈 Performance Optimization

### 1. Build Optimization

- Enable Next.js optimizations
- Use dynamic imports for large components
- Optimize images with Next.js Image component

### 2. Database Optimization

- Ensure proper indexes are created
- Use connection pooling
- Implement caching strategies

### 3. CDN Configuration

- Configure Supabase Storage CDN
- Use Vercel Edge Functions if needed
- Implement proper caching headers

## 🔄 Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

If you encounter deployment issues:

1. Check the [Next.js deployment docs](https://nextjs.org/docs/deployment)
2. Review [Vercel documentation](https://vercel.com/docs)
3. Check [Supabase deployment guide](https://supabase.com/docs/guides/deployment)
4. Open an issue in the project repository

---

**Happy Deploying! 🚀**
