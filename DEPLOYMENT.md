# 🚀 Deployment Guide - Bac Informatique Website

## 📋 Prerequisites

1. ✅ **Neon Database** - Already configured
2. ⏳ **Cloudinary Account** - Sign up at https://cloudinary.com/users/register/free
3. ⏳ **Hosting Platform** - Choose one: Railway, Render, or Vercel

## 🔧 Step 1: Configure Cloudinary

1. **Sign up** at https://cloudinary.com/users/register/free
2. **Get your credentials** from the dashboard:
   - Cloud Name
   - API Key  
   - API Secret
3. **Update your .env file**:
   ```env
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

## 🚀 Step 2: Choose Hosting Platform

### Option A: Railway (Recommended)

1. **Sign up** at https://railway.app
2. **Connect GitHub** and import your repository
3. **Set environment variables** in Railway dashboard:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_WlV34dxaEquZ@ep-still-bush-a26051gk-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=super_secret_jwt_key_for_bac_informatique_2024_make_it_very_long_and_random
   SESSION_SECRET=session_secret_for_bac_informatique_also_very_random_and_secure
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ADMIN_EMAIL=admin@bacinfo.tn
   ADMIN_PASSWORD=admin123456
   NODE_ENV=production
   ```
4. **Deploy** - Railway will automatically build and deploy

### Option B: Render

1. **Sign up** at https://render.com
2. **Create new Web Service** from GitHub
3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm run server`
   - Environment: Node
4. **Add environment variables** (same as Railway)

### Option C: Vercel (Frontend + Serverless)

1. **Sign up** at https://vercel.com
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Deploy**: `vercel --prod`
4. **Configure serverless functions** (requires code modifications)

## 🔍 Step 3: Test Deployment

1. **Check health endpoint**: `https://your-domain.com/api/health`
2. **Test calculator**: `https://your-domain.com/simple.html`
3. **Test exams page**: `https://your-domain.com/exams.html`
4. **Test admin panel**: `https://your-domain.com/admin.html`

## 📊 Step 4: Add Real Exam Files

1. **Login to admin panel** with:
   - Email: admin@bacinfo.tn
   - Password: admin123456
2. **Upload PDF files** for each subject/year/session
3. **Verify downloads** work correctly

## 🔒 Step 5: Security (Production)

1. **Change admin password** in production
2. **Update JWT secrets** with strong random values
3. **Configure CORS** for your domain
4. **Enable HTTPS** (automatic on most platforms)

## 🌐 Step 6: Custom Domain (Optional)

1. **Purchase domain** or use subdomain
2. **Configure DNS** in hosting platform
3. **Update CORS settings** in server.js

## 📈 Monitoring

- **Health checks**: `/api/health`
- **Database status**: Check Neon dashboard
- **File storage**: Check Cloudinary dashboard
- **Server logs**: Check hosting platform logs

## 🆘 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon DB is active
- Run migrations: `npm run db:migrate`

### File Upload Issues  
- Verify Cloudinary credentials
- Check file size limits (50MB max)
- Ensure PDF format only

### CORS Issues
- Update allowed origins in server.js
- Check environment variables

## 📞 Support

- **Database**: Neon DB documentation
- **Storage**: Cloudinary documentation  
- **Hosting**: Platform-specific documentation
