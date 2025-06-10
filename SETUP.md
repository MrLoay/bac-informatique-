# 🚀 Setup Guide - Bac Informatique Platform

This guide will help you set up the complete platform with PostgreSQL database, Cloudinary storage, and authentication.

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Cloudinary account (free tier available)

## 🗄️ Database Setup (PostgreSQL)

### 1. Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE moyenne_bac;

# Create user (optional)
CREATE USER bac_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE moyenne_bac TO bac_admin;

# Exit
\q
```

### 3. Update Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moyenne_bac
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

## ☁️ Cloudinary Setup (Free Cloud Storage)

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to Dashboard to get your credentials

### 2. Get API Credentials

From your Cloudinary Dashboard, copy:
- Cloud Name
- API Key
- API Secret

### 3. Update Environment Variables

Add to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Seed Database with Initial Data

```bash
npm run db:seed
```

### 4. Start the Application

```bash
npm run start
```

This will start both the backend server (port 3001) and frontend dev server (port 5173).

## 🔐 Authentication

### Default Admin Credentials

- **Email:** admin@bacinfo.tn
- **Password:** admin123456

### Login Process

1. Go to `http://localhost:3001/login.html`
2. Use the default credentials
3. Access admin panel at `http://localhost:3001/admin.html`

## 📚 Available URLs

- **Calculator:** `http://localhost:3001/simple.html`
- **Exams:** `http://localhost:3001/exams.html`
- **Admin Login:** `http://localhost:3001/login.html`
- **Admin Panel:** `http://localhost:3001/admin.html`
- **API Health:** `http://localhost:3001/api/health`

## 🎯 Features

### ✅ Implemented

- **PostgreSQL Database** with proper schema
- **Cloudinary Integration** for PDF storage
- **JWT Authentication** with sessions
- **File Upload System** with validation
- **Admin Panel** with authentication
- **Download/View Analytics** tracking
- **Rate Limiting** and security headers
- **Responsive Design** for all devices

### 📤 File Upload

1. Login to admin panel
2. Select subject, year, session
3. Choose file type (exam or correction)
4. Drag & drop or select PDF files
5. Files are uploaded to Cloudinary automatically

### 📊 Analytics

- Download counts per exam
- View counts per exam
- File size tracking
- User activity logs

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status
- `GET /api/auth/profile` - Get user profile

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/stats` - Get statistics
- `POST /api/exams/upload` - Upload files (admin only)
- `GET /api/exams/download/:subject/:year/:session/:type` - Download/view files
- `DELETE /api/exams/:subject/:year/:session` - Delete exam (admin only)

### Health
- `GET /api/health` - System health check

## 🛠️ Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc (look for PostgreSQL)
   
   # macOS/Linux
   brew services list | grep postgresql
   sudo systemctl status postgresql
   ```

2. Verify credentials in `.env` file
3. Test connection: `psql -U postgres -d moyenne_bac`

### Cloudinary Issues

1. Verify credentials in `.env` file
2. Check API limits on Cloudinary dashboard
3. Test connection at `http://localhost:3001/api/health`

### File Upload Issues

1. Check file size (max 50MB)
2. Ensure file is PDF format
3. Verify admin authentication
4. Check browser console for errors

## 🔒 Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **JWT tokens** with expiration
- **Session management** with PostgreSQL
- **Input validation** and sanitization
- **CORS protection** with whitelist

## 📈 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=strong_production_password
JWT_SECRET=very_long_random_string
SESSION_SECRET=another_long_random_string
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT/session secrets
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Monitor Cloudinary usage

## 📞 Support

If you encounter any issues:

1. Check the console logs
2. Verify environment variables
3. Test database connection
4. Check Cloudinary dashboard
5. Review the troubleshooting section

The platform is now ready for production use with real PDF files and secure authentication! 🎉
