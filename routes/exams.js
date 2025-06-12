const express = require('express');
const multer = require('multer');
const { pool } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Try to import Cloudinary, but handle if not configured
let cloudinaryConfig = null;
try {
  cloudinaryConfig = require('../config/cloudinary');
} catch (error) {
  console.warn('Cloudinary not configured, using fallback storage');
}

const router = express.Router();

// Configure multer with fallback storage
const upload = multer({
  storage: cloudinaryConfig ? cloudinaryConfig.storage : multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024 // Default 50MB
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, name, coefficient, description, icon, is_required, min_grade
      FROM subjects 
      ORDER BY coefficient DESC, name
    `);
    client.release();

    res.json({ success: true, subjects: result.rows });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get all exams with subjects
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        e.id,
        e.subject_id,
        s.name as subject_name,
        s.coefficient,
        s.icon,
        e.year,
        e.session,
        e.filename,
        e.correction_filename,
        e.cloudinary_public_id,
        e.correction_cloudinary_public_id,
        e.file_size,
        e.correction_file_size,
        e.download_count,
        e.view_count,
        e.is_available,
        e.created_at
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.is_available = true
      ORDER BY e.year DESC, e.session, s.name
    `);
    client.release();

    // Group exams by subject
    const examsBySubject = {};
    result.rows.forEach(exam => {
      if (!examsBySubject[exam.subject_id]) {
        examsBySubject[exam.subject_id] = {
          name: exam.subject_name,
          coefficient: exam.coefficient,
          icon: exam.icon,
          exams: {}
        };
      }

      if (!examsBySubject[exam.subject_id].exams[exam.year]) {
        examsBySubject[exam.subject_id].exams[exam.year] = {};
      }

      examsBySubject[exam.subject_id].exams[exam.year][exam.session] = {
        id: exam.id,
        available: exam.is_available,
        filename: exam.filename,
        correction: exam.correction_filename,
        cloudinary_public_id: exam.cloudinary_public_id,
        correction_cloudinary_public_id: exam.correction_cloudinary_public_id,
        file_size: exam.file_size,
        correction_file_size: exam.correction_file_size,
        download_count: exam.download_count,
        view_count: exam.view_count,
        created_at: exam.created_at
      };
    });

    res.json(examsBySubject);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get exam statistics
router.get('/stats', async (req, res) => {
  try {
    const client = await pool.connect();
    
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as total_exams,
        COUNT(DISTINCT e.subject_id) as total_subjects,
        COUNT(DISTINCT e.year) as years_covered,
        COALESCE(SUM(e.file_size + COALESCE(e.correction_file_size, 0)), 0) as total_size_bytes,
        SUM(e.download_count) as total_downloads,
        SUM(e.view_count) as total_views
      FROM exams e
      WHERE e.is_available = true
    `;
    
    const result = await client.query(statsQuery);
    client.release();

    const stats = result.rows[0];
    const totalSizeMB = Math.round(stats.total_size_bytes / 1024 / 1024 * 100) / 100;

    res.json({
      totalExams: parseInt(stats.total_exams),
      totalSubjects: parseInt(stats.total_subjects),
      yearsCovered: parseInt(stats.years_covered),
      totalSize: totalSizeMB,
      totalDownloads: parseInt(stats.total_downloads || 0),
      totalViews: parseInt(stats.total_views || 0)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Upload exam files (protected route)
router.post('/upload', verifyToken, requireAdmin, upload.array('files'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { subject, year, session, fileType } = req.body;
    
    if (!subject || !year || !session || !fileType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    await client.query('BEGIN');

    for (const file of req.files) {
      // Check if exam already exists
      const existingExam = await client.query(
        'SELECT id FROM exams WHERE subject_id = $1 AND year = $2 AND session = $3',
        [subject, year, session]
      );

      if (existingExam.rows.length > 0) {
        // Update existing exam
        const examId = existingExam.rows[0].id;
        
        if (fileType === 'correction') {
          await client.query(`
            UPDATE exams
            SET correction_filename = $1,
                correction_cloudinary_public_id = $2,
                correction_file_size = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
          `, [file.filename || file.originalname, file.public_id || null, file.size, examId]);
        } else {
          await client.query(`
            UPDATE exams
            SET filename = $1,
                cloudinary_public_id = $2,
                file_size = $3,
                is_available = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
          `, [file.filename || file.originalname, file.public_id || null, file.size, examId]);
        }
      } else {
        // Create new exam
        const insertQuery = fileType === 'correction'
          ? `INSERT INTO exams (subject_id, year, session, correction_filename, correction_cloudinary_public_id, correction_file_size, uploaded_by, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7, false)`
          : `INSERT INTO exams (subject_id, year, session, filename, cloudinary_public_id, file_size, uploaded_by, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true)`;

        await client.query(insertQuery, [
          subject, year, session, file.filename || file.originalname, file.public_id || null, file.size, req.user ? req.user.id : null
        ]);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      files: req.files.map(f => ({
        filename: f.filename || f.originalname,
        public_id: f.public_id || null,
        size: f.size,
        url: cloudinaryConfig && f.public_id ? cloudinaryConfig.getCloudinaryUrl(f.public_id) : null
      }))
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  } finally {
    client.release();
  }
});

// Download/view exam file
router.get('/download/:subject/:year/:session/:type?', async (req, res) => {
  try {
    const { subject, year, session, type } = req.params;
    const isCorrection = type === 'correction';
    
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id,
        ${isCorrection ? 'correction_filename as filename, correction_cloudinary_public_id as public_id' : 'filename, cloudinary_public_id as public_id'}
      FROM exams 
      WHERE subject_id = $1 AND year = $2 AND session = $3 AND is_available = true
    `, [subject, year, session]);

    if (result.rows.length === 0 || !result.rows[0].public_id) {
      client.release();
      return res.status(404).json({ error: 'Exam file not found' });
    }

    const exam = result.rows[0];
    
    // Log download/view
    await client.query(`
      INSERT INTO download_logs (exam_id, file_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4)
    `, [exam.id, isCorrection ? 'correction' : 'exam', req.ip, req.get('User-Agent')]);

    // Update counters
    const counterField = req.query.action === 'view' ? 'view_count' : 'download_count';
    await client.query(`
      UPDATE exams SET ${counterField} = ${counterField} + 1 WHERE id = $1
    `, [exam.id]);

    client.release();

    // Handle file URL based on storage type
    if (cloudinaryConfig && exam.public_id) {
      // Get Cloudinary URL
      const fileUrl = cloudinaryConfig.getCloudinaryUrl(exam.public_id);

      if (req.query.action === 'view') {
        // Redirect to view the file
        res.redirect(fileUrl);
      } else {
        // Force download
        res.redirect(fileUrl + '&fl_attachment');
      }
    } else {
      // No cloud storage, return demo message
      res.status(404).json({
        error: 'File not available in demo mode',
        message: 'Configure Cloudinary for file downloads'
      });
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete exam (protected route)
router.delete('/:subject/:year/:session', verifyToken, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { subject, year, session } = req.params;
    const { fileType } = req.query;

    const result = await client.query(`
      SELECT id, cloudinary_public_id, correction_cloudinary_public_id
      FROM exams 
      WHERE subject_id = $1 AND year = $2 AND session = $3
    `, [subject, year, session]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Exam not found' });
    }

    const exam = result.rows[0];

    await client.query('BEGIN');

    if (fileType === 'correction' && exam.correction_cloudinary_public_id) {
      // Delete correction file
      if (cloudinaryConfig) {
        await cloudinaryConfig.deleteFromCloudinary(exam.correction_cloudinary_public_id);
      }
      await client.query(`
        UPDATE exams
        SET correction_filename = NULL,
            correction_cloudinary_public_id = NULL,
            correction_file_size = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [exam.id]);
    } else if (fileType === 'exam' && exam.cloudinary_public_id) {
      // Delete main exam file
      if (cloudinaryConfig) {
        await cloudinaryConfig.deleteFromCloudinary(exam.cloudinary_public_id);
      }
      await client.query(`
        UPDATE exams
        SET filename = NULL,
            cloudinary_public_id = NULL,
            file_size = NULL,
            is_available = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [exam.id]);
    } else {
      // Delete entire exam record
      await client.query('DELETE FROM exams WHERE id = $1', [exam.id]);

      // Delete from Cloudinary if configured
      if (cloudinaryConfig) {
        if (exam.cloudinary_public_id) {
          await cloudinaryConfig.deleteFromCloudinary(exam.cloudinary_public_id);
        }
        if (exam.correction_cloudinary_public_id) {
          await cloudinaryConfig.deleteFromCloudinary(exam.correction_cloudinary_public_id);
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Exam deleted successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  } finally {
    client.release();
  }
});

module.exports = router;
