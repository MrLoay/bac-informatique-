# 🚀 Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Cloudinary account created
- [ ] Cloudinary credentials obtained
- [ ] Railway/Render account created
- [ ] GitHub repository ready

## 🌤️ Cloudinary Setup

### Step 1: Get Credentials
1. Go to https://cloudinary.com/console
2. Copy these values:
   - **Cloud Name**: (e.g., `dxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (e.g., `abcdefghijklmnopqrstuvwxyz`)

### Step 2: Configure Locally
```bash
npm run setup:cloudinary
```
Enter your credentials when prompted.

### Step 3: Test Upload
1. Restart server: `npm run server`
2. Go to: http://localhost:3001/admin.html
3. Login with: admin@bacinfo.tn / admin123456
4. Try uploading a test PDF

## 🚂 Railway Deployment

### Step 1: Create Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Deploy Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your bac-informatique repository
4. Railway will auto-detect Node.js

### Step 3: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```
DATABASE_URL=postgresql://neondb_owner:npg_WlV34dxaEquZ@ep-still-bush-a26051gk-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=super_secret_jwt_key_for_bac_informatique_2024_make_it_very_long_and_random_PRODUCTION
SESSION_SECRET=session_secret_for_bac_informatique_also_very_random_and_secure_PRODUCTION
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_EMAIL=admin@bacinfo.tn
ADMIN_PASSWORD=your_secure_password
NODE_ENV=production
PORT=3001
```

### Step 4: Deploy
1. Railway will automatically deploy
2. Wait for build to complete
3. Get your app URL (e.g., `https://your-app.railway.app`)

## 🔧 Alternative: Render Deployment

### Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: bac-informatique
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`

### Step 3: Add Environment Variables
Same as Railway variables above.

## ✅ Post-Deployment Checklist

### Test Your Deployed App
- [ ] Visit your app URL
- [ ] Test calculator: `/simple.html`
- [ ] Test exams page: `/exams.html`
- [ ] Test admin login: `/admin.html`
- [ ] Test API health: `/api/health`

### Upload Real Exam Files
- [ ] Login to admin panel
- [ ] Upload PDF files for each subject
- [ ] Test download functionality
- [ ] Verify file storage in Cloudinary

### Security Updates
- [ ] Change admin password
- [ ] Update JWT secrets
- [ ] Configure custom domain (optional)

## 🆘 Troubleshooting

### Common Issues
1. **Build fails**: Check Node.js version (should be 18+)
2. **Database connection**: Verify DATABASE_URL
3. **File uploads fail**: Check Cloudinary credentials
4. **CORS errors**: Update FRONTEND_URL variable

### Getting Help
- Check deployment logs in platform dashboard
- Test API endpoints individually
- Verify environment variables are set correctly
