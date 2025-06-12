# 🎓 Bac Informatique Tunisie - Website

A comprehensive web application for Tunisian bac informatique students featuring grade calculation and past exam papers.

## ✨ Features

- 🧮 **Grade Calculator** - Calculate your bac informatique average with correct coefficients
- 📚 **Past Exam Papers** - Access years of previous exam papers with corrections
- 🔐 **Admin Panel** - Upload and manage exam files
- 📊 **Statistics** - Track downloads and usage
- 🌐 **Responsive Design** - Works on all devices
- ☁️ **Cloud Storage** - Files stored securely on Cloudinary
- 🗄️ **Database** - Powered by Neon PostgreSQL

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database (free tier available)
- Cloudinary account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd moyenne-bac
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up database**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Configure Cloudinary** (optional for file uploads)

   ```bash
   npm run setup:cloudinary
   ```

5. **Start the server**

   ```bash
   npm run server
   ```

6. **Visit the website**
   - Calculator: http://localhost:3001/simple.html
   - Exams: http://localhost:3001/exams.html
   - Admin: http://localhost:3001/admin.html

## 📖 Usage

### For Students

- **Calculate Grades**: Enter your marks to see your average
- **Download Exams**: Browse and download past exam papers
- **Study Resources**: Access corrections and solutions

### For Administrators

- **Login**: Use admin@bacinfo.tn / admin123456
- **Upload Files**: Add new exam papers and corrections
- **Manage Content**: Update subjects and exam availability

## 🏗️ Architecture

### Frontend

- Vanilla JavaScript with modern ES6+
- Responsive CSS with CSS Grid and Flexbox
- Progressive Web App features

### Backend

- Node.js with Express.js
- PostgreSQL database with connection pooling
- JWT authentication for admin access
- File upload with Cloudinary integration
- Rate limiting and security headers

### Database Schema

- **subjects**: Subject information with coefficients
- **exams**: Exam files with metadata
- **users**: Admin authentication
- **download_logs**: Usage analytics

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

- **Railway**: `railway up` (recommended)
- **Render**: Connect GitHub repository
- **Vercel**: `vercel --prod`

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=your_neon_db_url

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_EMAIL=admin@bacinfo.tn
ADMIN_PASSWORD=your_secure_password
```

## 📊 Bac Informatique Subjects

| Subject                   | Coefficient | Type     |
| ------------------------- | ----------- | -------- |
| Mathématiques             | 3           | Required |
| Sciences Physiques        | 2           | Required |
| Programmation (Théorique) | 3           | Required |
| Programmation (Pratique)  | 3           | Required |
| STI (Théorique)           | 3           | Required |
| STI (Pratique)            | 3           | Required |
| Français                  | 1           | Required |
| Arabe                     | 1           | Required |
| Anglais                   | 1           | Required |
| Philosophie               | 1           | Required |
| Sport                     | 1           | Required |
| Allemand                  | 1           | Optional |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Create a GitHub issue
- **Email**: Contact the maintainer
- **Documentation**: Check the docs folder

## 🙏 Acknowledgments

- Tunisian Ministry of Education for exam paper formats
- Neon for database hosting
- Cloudinary for file storage
- All contributors and users
