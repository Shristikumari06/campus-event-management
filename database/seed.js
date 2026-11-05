/**
 * Database Seeder
 * Populates default administrator and realistic sample campus events.
 */

const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Check and seed Default Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@campusconnect.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'Prof. Robert Harrison (Dean of Student Affairs)';

    const existingAdmin = await db.get('SELECT id FROM USERS WHERE email = ?', [adminEmail]);
    let adminId;

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const res = await db.run(
        `INSERT INTO USERS (full_name, email, student_id, department, study_year, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminName,
          adminEmail,
          'FAC-ADMIN-01',
          'Student Affairs & Administration',
          'Faculty Coordinator',
          passwordHash,
          'admin'
        ]
      );
      adminId = res.lastID;
      console.log(`✅ Default Administrator seeded: ${adminEmail} (Password: ${adminPassword})`);
    } else {
      adminId = existingAdmin.id;
      console.log(`ℹ️ Admin already exists with ID: ${adminId}`);
    }

    // 2. Check and seed Sample Events
    const eventCount = await db.get('SELECT COUNT(*) as count FROM EVENTS');
    if (eventCount && eventCount.count > 0) {
      console.log(`ℹ️ Events table already has ${eventCount.count} events. Skipping sample insertion.`);
      return;
    }

    const sampleEvents = [
      {
        title: 'TechFest 2026: Quantum Leap',
        description: 'The flagship annual engineering symposium showcasing artificial intelligence demonstrations, robotics arena battles, ethical hacking workshops, and guest keynotes from leading Silicon Valley researchers.',
        category: 'College Fest',
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        venue: 'Dr. A.P.J. Abdul Kalam Auditorium',
        start_datetime: '2026-11-12 09:30:00',
        end_datetime: '2026-11-12 17:30:00',
        registration_deadline: '2026-11-11 23:59:00',
        capacity: 400,
        eligibility: 'Open to All Enrolled University Students',
        organizer_id: adminId
      },
      {
        title: 'Campus Music Night: Euphoria 2026',
        description: 'An electrifying night of live indie rock, campus battle-of-the-bands, Bollywood acoustic medleys, and neon light stages. Grab your glowsticks and sing along under the campus stars!',
        category: 'Cultural',
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        venue: 'University Open-Air Amphitheatre',
        start_datetime: '2026-11-18 18:00:00',
        end_datetime: '2026-11-18 22:30:00',
        registration_deadline: '2026-11-17 23:59:00',
        capacity: 800,
        eligibility: 'Valid Student ID Card Required',
        organizer_id: adminId
      },
      {
        title: 'Innovate Hackathon: 36H CodeSprint',
        description: 'Build cutting-edge full-stack, Web3, and machine learning solutions addressing real-world civic and healthcare challenges. Over $5,000 in prizes, free food, mentor workshops, and direct angel funding opportunities.',
        category: 'Competition',
        image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        venue: 'Innovation & Incubation Hub, Block B',
        start_datetime: '2026-11-22 08:00:00',
        end_datetime: '2026-11-23 20:00:00',
        registration_deadline: '2026-11-20 23:59:00',
        capacity: 250,
        eligibility: 'Teams of 2-4 Students (UG/PG All Branches)',
        organizer_id: adminId
      },
      {
        title: 'Hands-on Generative AI & LLM Systems Workshop',
        description: 'Master fine-tuning foundational models, vector embeddings, and LangChain orchestration with hands-on coding notebooks and enterprise mentor guidance.',
        category: 'Workshop',
        image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        venue: 'Advanced AI & Data Analytics Lab',
        start_datetime: '2026-11-28 10:00:00',
        end_datetime: '2026-11-28 16:30:00',
        registration_deadline: '2026-11-27 23:59:00',
        capacity: 120,
        eligibility: 'Basic Python Knowledge Recommended',
        organizer_id: adminId
      },
      {
        title: 'Annual Inter-College Athletics Meet',
        description: 'Witness adrenaline-packed track and field sprints, inter-departmental football finals, relay championships, and cheer performances. Medals, certificates, and university sports honors awarded at closing ceremony.',
        category: 'Sports',
        image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        venue: 'Main Campus Sports Complex & Track',
        start_datetime: '2026-12-04 07:30:00',
        end_datetime: '2026-12-04 16:00:00',
        registration_deadline: '2026-12-02 23:59:00',
        capacity: 600,
        eligibility: 'Medical Fitness Certificate Required',
        organizer_id: adminId
      },
      {
        title: 'National Leadership & Policy Seminar',
        description: 'Keynote discourse by distinguished diplomatic ambassadors and public administrators analyzing economic resilience, sustainable infrastructure, and global governance in 2027.',
        category: 'Seminar',
        image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
        venue: 'Senate Hall, Administration Tower',
        start_datetime: '2026-12-10 11:00:00',
        end_datetime: '2026-12-10 15:30:00',
        registration_deadline: '2026-12-09 23:59:00',
        capacity: 220,
        eligibility: 'Open to All Undergraduate & Postgraduate Scholars',
        organizer_id: adminId
      },
      {
        title: 'Global Entrepreneurship & Venture Summit',
        description: 'Pitch your early startup prototype to angel investors, network with alumni founders, and attend keynote panels discussing venture capital funding, product-market fit, and scaling tech ventures in 2027.',
        category: 'Business',
        image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        venue: 'School of Management Executive Hall',
        start_datetime: '2026-12-15 10:00:00',
        end_datetime: '2026-12-15 17:00:00',
        registration_deadline: '2026-12-14 23:59:00',
        capacity: 300,
        eligibility: 'Pre-Incubated Ventures & Solo Founders',
        organizer_id: adminId
      }
    ];

    for (const ev of sampleEvents) {
      await db.run(
        `INSERT INTO EVENTS (title, description, category, image_url, venue, start_datetime, end_datetime, registration_deadline, capacity, eligibility, organizer_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ev.title,
          ev.description,
          ev.category,
          ev.image_url,
          ev.venue,
          ev.start_datetime,
          ev.end_datetime,
          ev.registration_deadline,
          ev.capacity,
          ev.eligibility || 'Open to All Students',
          ev.organizer_id
        ]
      );
    }

    console.log(`✅ Seeded ${sampleEvents.length} flagship campus events!`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Allow direct execution: node database/seed.js
if (require.main === module) {
  const initDb = require('./init');
  initDb().then(() => {
    seedDatabase().then(() => {
      console.log('🎉 Seeding completed successfully.');
      process.exit(0);
    });
  });
}

module.exports = seedDatabase;

