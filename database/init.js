/**
 * SQLite Database Schema Initializer
 * Creates tables, unique constraints, foreign keys, and indexes.
 */

const db = require('./db');

async function initDatabase() {
  console.log('🔄 Initializing database schema...');

  // 1. USERS Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      student_id TEXT UNIQUE NOT NULL COLLATE NOCASE,
      department TEXT NOT NULL,
      study_year TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. EVENTS Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS EVENTS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      venue TEXT NOT NULL,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      registration_deadline TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK(capacity > 0),
      eligibility TEXT DEFAULT 'Open to All Students',
      organizer_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES USERS(id) ON DELETE SET NULL
    );
  `);

  // Migrate existing EVENTS table if eligibility column is missing
  try {
    const tableInfo = await db.all('PRAGMA table_info(EVENTS)');
    const hasEligibility = tableInfo.some(col => col.name === 'eligibility');
    if (!hasEligibility) {
      await db.exec("ALTER TABLE EVENTS ADD COLUMN eligibility TEXT DEFAULT 'Open to All Students'");
      console.log('✅ Added eligibility column to EVENTS table.');
    }
  } catch (err) {
    console.warn('⚠️ Column check warning:', err.message);
  }

  // 3. REGISTRATIONS Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS REGISTRATIONS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registration_status TEXT NOT NULL DEFAULT 'confirmed' CHECK(registration_status IN ('confirmed', 'cancelled', 'attended')),
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES EVENTS(id) ON DELETE CASCADE,
      UNIQUE(user_id, event_id)
    );
  `);

  // 4. Performance Indexes
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON USERS(email);
    CREATE INDEX IF NOT EXISTS idx_users_student_id ON USERS(student_id);
    CREATE INDEX IF NOT EXISTS idx_events_category ON EVENTS(category);
    CREATE INDEX IF NOT EXISTS idx_events_start ON EVENTS(start_datetime);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON REGISTRATIONS(user_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON REGISTRATIONS(event_id);
  `);

  console.log('✅ Database schema verified and initialized.');

  // Automatically seed default data if not already present
  const seedDatabase = require('./seed');
  await seedDatabase();
}

module.exports = initDatabase;

