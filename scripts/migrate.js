const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`,
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️ Creating database tables...');

    // Users table for authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subjects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        coefficient INTEGER NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        is_required BOOLEAN DEFAULT true,
        min_grade DECIMAL(4,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Exams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        subject_id VARCHAR(50) REFERENCES subjects(id),
        year INTEGER NOT NULL,
        session VARCHAR(20) NOT NULL,
        filename VARCHAR(255),
        correction_filename VARCHAR(255),
        cloudinary_public_id VARCHAR(255),
        correction_cloudinary_public_id VARCHAR(255),
        file_size BIGINT,
        correction_file_size BIGINT,
        download_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(subject_id, year, session)
      )
    `);

    // Download logs table for analytics
    await client.query(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER REFERENCES exams(id),
        file_type VARCHAR(20) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table for express-session
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

    await client.query(`
      ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exams_subject_year ON exams(subject_id, year);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exams_available ON exams(is_available);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_download_logs_exam ON download_logs(exam_id);
    `);

    console.log('✅ Database tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createTables();
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTables };
