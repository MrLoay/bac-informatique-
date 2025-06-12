const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`,
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bacinfo.tn';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        updated_at = CURRENT_TIMESTAMP
    `, [adminEmail, hashedPassword]);

    console.log(`✅ Admin user created: ${adminEmail}`);

    // Insert subjects
    const subjects = [
      {
        id: 'math',
        name: 'Mathématiques',
        coefficient: 3,
        description: 'Analyse, algèbre, géométrie, probabilités',
        icon: '🔢',
        is_required: true
      },
      {
        id: 'sciences_physiques',
        name: 'Sciences Physiques',
        coefficient: 2,
        description: 'Physique et chimie appliquées',
        icon: '⚗️',
        is_required: true
      },
      {
        id: 'programmation_theorique',
        name: 'Programmation (Théorique)',
        coefficient: 3,
        description: 'Algorithmes, structures de données, concepts théoriques',
        icon: '📝',
        is_required: true
      },
      {
        id: 'programmation_pratique',
        name: 'Programmation (Pratique)',
        coefficient: 3,
        description: 'Codage, implémentation, exercices pratiques',
        icon: '💻',
        is_required: true
      },
      {
        id: 'sti_theorique',
        name: 'STI (Théorique)',
        coefficient: 3,
        description: 'Concepts théoriques des sciences et technologies',
        icon: '📚',
        is_required: true
      },
      {
        id: 'sti_pratique',
        name: 'STI (Pratique)',
        coefficient: 3,
        description: 'Travaux pratiques, manipulation, expériences',
        icon: '🔧',
        is_required: true
      },
      {
        id: 'francais',
        name: 'Français',
        coefficient: 1,
        description: 'Littérature, expression écrite et orale',
        icon: '🇫🇷',
        is_required: true
      },
      {
        id: 'arabe',
        name: 'Arabe',
        coefficient: 1,
        description: 'Langue et littérature arabes',
        icon: '🇹🇳',
        is_required: true
      },
      {
        id: 'anglais',
        name: 'Anglais',
        coefficient: 1,
        description: 'Compréhension et expression anglaises',
        icon: '🇬🇧',
        is_required: true
      },
      {
        id: 'philosophie',
        name: 'Philosophie',
        coefficient: 1,
        description: 'Réflexion critique et argumentation',
        icon: '🤔',
        is_required: true
      },
      {
        id: 'allemand',
        name: 'Allemand',
        coefficient: 1,
        description: 'Langue allemande (optionnel)',
        icon: '🇩🇪',
        is_required: false,
        min_grade: 10.0
      },
      {
        id: 'sport',
        name: 'Sport (Contrôle Continu)',
        coefficient: 1,
        description: 'Évaluation pratique - pas d\'examen écrit',
        icon: '⚽',
        is_required: true
      }
    ];

    for (const subject of subjects) {
      await client.query(`
        INSERT INTO subjects (id, name, coefficient, description, icon, is_required, min_grade)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = $2,
          coefficient = $3,
          description = $4,
          icon = $5,
          is_required = $6,
          min_grade = $7
      `, [
        subject.id,
        subject.name,
        subject.coefficient,
        subject.description,
        subject.icon,
        subject.is_required,
        subject.min_grade || null
      ]);
    }

    console.log('✅ Subjects seeded successfully!');

    // Insert sample exams (you can add real exam data here)
    const sampleExams = [
      // Math exams
      { subject_id: 'math', year: 2023, session: 'principale', filename: 'math_2023_principale.pdf', is_available: true },
      { subject_id: 'math', year: 2023, session: 'controle', filename: 'math_2023_controle.pdf', is_available: true },
      { subject_id: 'math', year: 2022, session: 'principale', filename: 'math_2022_principale.pdf', is_available: true },
      { subject_id: 'math', year: 2022, session: 'controle', filename: 'math_2022_controle.pdf', is_available: true },
      { subject_id: 'math', year: 2021, session: 'principale', filename: 'math_2021_principale.pdf', is_available: true },

      // Sciences Physiques
      { subject_id: 'sciences_physiques', year: 2023, session: 'principale', filename: 'sciences_physiques_2023_principale.pdf', is_available: true },
      { subject_id: 'sciences_physiques', year: 2023, session: 'controle', filename: 'sciences_physiques_2023_controle.pdf', is_available: true },
      { subject_id: 'sciences_physiques', year: 2022, session: 'principale', filename: 'sciences_physiques_2022_principale.pdf', is_available: true },

      // Programmation Théorique
      { subject_id: 'programmation_theorique', year: 2023, session: 'principale', filename: 'programmation_theorique_2023_principale.pdf', is_available: true },
      { subject_id: 'programmation_theorique', year: 2023, session: 'controle', filename: 'programmation_theorique_2023_controle.pdf', is_available: true },
      { subject_id: 'programmation_theorique', year: 2022, session: 'principale', filename: 'programmation_theorique_2022_principale.pdf', is_available: true },

      // Programmation Pratique
      { subject_id: 'programmation_pratique', year: 2023, session: 'principale', filename: 'programmation_pratique_2023_principale.pdf', is_available: true },
      { subject_id: 'programmation_pratique', year: 2022, session: 'principale', filename: 'programmation_pratique_2022_principale.pdf', is_available: true },

      // STI Théorique
      { subject_id: 'sti_theorique', year: 2023, session: 'principale', filename: 'sti_theorique_2023_principale.pdf', is_available: true },
      { subject_id: 'sti_theorique', year: 2022, session: 'principale', filename: 'sti_theorique_2022_principale.pdf', is_available: true },

      // Languages
      { subject_id: 'francais', year: 2023, session: 'principale', filename: 'francais_2023_principale.pdf', is_available: true },
      { subject_id: 'arabe', year: 2023, session: 'principale', filename: 'arabe_2023_principale.pdf', is_available: true },
      { subject_id: 'anglais', year: 2023, session: 'principale', filename: 'anglais_2023_principale.pdf', is_available: true },
      { subject_id: 'philosophie', year: 2023, session: 'principale', filename: 'philosophie_2023_principale.pdf', is_available: true }
    ];

    for (const exam of sampleExams) {
      await client.query(`
        INSERT INTO exams (subject_id, year, session, filename, is_available)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (subject_id, year, session) DO UPDATE SET
          filename = $4,
          is_available = $5,
          updated_at = CURRENT_TIMESTAMP
      `, [
        exam.subject_id,
        exam.year,
        exam.session,
        exam.filename,
        exam.is_available
      ]);
    }

    console.log('✅ Sample exams seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await seedDatabase();
    console.log('🎉 Database seeded successfully!');
    console.log(`📧 Admin login: ${process.env.ADMIN_EMAIL || 'admin@bacinfo.tn'}`);
    console.log(`🔑 Admin password: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedDatabase };
