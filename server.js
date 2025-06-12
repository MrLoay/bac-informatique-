const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import configurations and routes
const { pool, testConnection } = require('./config/database');
const { testCloudinaryConnection } = require('./config/cloudinary');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-app.railway.app'] // Will be updated with actual domain
    : ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration (using memory store for now)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

console.log('✅ Using memory session store');

// Static file serving
app.use(express.static('public'));
app.use(express.static('.'));
app.use(express.static(__dirname));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

// Fallback route for old JSON-based system (when database is not available)
app.get('/api/exams-fallback', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const dbPath = path.join(__dirname, 'public', 'exams', 'exams-database.json');
    const data = await fs.readFile(dbPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading fallback exam database:', error);
    res.status(500).json({ error: 'Failed to load exam database' });
  }
});

// Configure multer for demo uploads (memory storage)
const multer = require('multer');
const demoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Demo upload endpoint that adds to database without file storage
app.post('/api/upload-demo', demoUpload.array('files'), async (req, res) => {
  try {
    console.log('Demo upload request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? req.files.length : 0);

    const { subject, year, session, fileType } = req.body;

    if (!subject || !year || !session || !fileType) {
      console.log('Missing required fields:', { subject, year, session, fileType });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Simulate file upload processing
    console.log('Processing upload...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to add to database if connected
    try {
      const { pool } = require('./config/database');
      const client = await pool.connect();

      // Check if exam already exists
      const existingExam = await client.query(
        'SELECT id FROM exams WHERE subject_id = $1 AND year = $2 AND session = $3',
        [subject, year, session]
      );

      const filename = `${subject}_${year}_${session}${fileType === 'correction' ? '_correction' : ''}.pdf`;

      if (existingExam.rows.length > 0) {
        // Update existing exam
        const examId = existingExam.rows[0].id;

        if (fileType === 'correction') {
          await client.query(`
            UPDATE exams
            SET correction_filename = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [filename, examId]);
        } else {
          await client.query(`
            UPDATE exams
            SET filename = $1,
                is_available = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [filename, examId]);
        }
      } else {
        // Create new exam
        const insertQuery = fileType === 'correction'
          ? `INSERT INTO exams (subject_id, year, session, correction_filename, is_available)
             VALUES ($1, $2, $3, $4, false)`
          : `INSERT INTO exams (subject_id, year, session, filename, is_available)
             VALUES ($1, $2, $3, $4, true)`;

        await client.query(insertQuery, [subject, year, session, filename]);
      }

      client.release();
      console.log('Database updated successfully');

      res.json({
        success: true,
        message: `Upload démo réussi - ${subject} ${year} ${session} ajouté à la base de données`,
        note: 'Mode démo: fichier non stocké physiquement',
        data: { subject, year, session, fileType }
      });

    } catch (dbError) {
      console.error('Database error in demo upload:', dbError);
      res.json({
        success: true,
        message: `Upload simulé avec succès - ${subject} ${year} ${session}`,
        note: 'Base de données non disponible - mode simulation',
        data: { subject, year, session, fileType }
      });
    }

  } catch (error) {
    console.error('Demo upload error:', error);
    res.status(500).json({ error: 'Erreur de simulation d\'upload' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  const cloudinaryConnected = await testCloudinaryConnection();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    cloudinary: cloudinaryConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
  }

  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server with database connection
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Database not connected. Running in demo mode with limited functionality.');
    }

    // Test Cloudinary connection (optional)
    const cloudinaryConnected = await testCloudinaryConnection();
    if (!cloudinaryConnected) {
      console.warn('⚠️ Cloudinary not configured. File uploads will not work.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Calculator: http://localhost:${PORT}/simple.html`);
      console.log(`📄 Exams: http://localhost:${PORT}/exams.html`);
      console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
      console.log(`🔑 API Health: http://localhost:${PORT}/api/health`);
      console.log(`💾 Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`☁️ Cloudinary: ${cloudinaryConnected ? '✅ Connected' : '⚠️ Not configured'}`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
