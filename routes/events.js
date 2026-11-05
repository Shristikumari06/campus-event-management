/**
 * Events Public & Student Routes
 * Handles event listing, filtering, search, and detailed view.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ============================================================================
// GET /api/events
// Fetch all events with dynamic registration counts, seats left, and filter/search
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const currentUserId = req.session && req.session.user ? req.session.user.id : null;

    let baseSql = `
      SELECT 
        e.*,
        u.full_name as organizer_name,
        u.email as organizer_email,
        (SELECT COUNT(*) FROM REGISTRATIONS r WHERE r.event_id = e.id AND r.registration_status = 'confirmed') as registered_count
        ${currentUserId ? `, (SELECT COUNT(*) FROM REGISTRATIONS ur WHERE ur.event_id = e.id AND ur.user_id = ? AND ur.registration_status = 'confirmed') as user_is_registered` : `, 0 as user_is_registered`}
      FROM EVENTS e
      LEFT JOIN USERS u ON e.organizer_id = u.id
      WHERE 1=1
    `;

    const params = [];
    if (currentUserId) {
      params.push(currentUserId);
    }

    // Category filter
    if (category && category !== 'all') {
      baseSql += ` AND e.category = ?`;
      params.push(category);
    }

    // Search query
    if (search && search.trim() !== '') {
      baseSql += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ? OR e.category LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    // Sorting
    switch (sort) {
      case 'date-desc':
        baseSql += ` ORDER BY e.start_datetime DESC`;
        break;
      case 'name-asc':
        baseSql += ` ORDER BY e.title ASC`;
        break;
      case 'popular':
        baseSql += ` ORDER BY registered_count DESC, e.capacity DESC`;
        break;
      case 'date-asc':
      default:
        baseSql += ` ORDER BY e.start_datetime ASC`;
        break;
    }

    const rows = await db.all(baseSql, params);

    // Compute status flags and available seats
    const now = new Date();
    const events = rows.map((ev) => {
      const registered = Number(ev.registered_count || 0);
      const capacity = Number(ev.capacity || 0);
      const available = Math.max(0, capacity - registered);
      const isFull = available <= 0;
      const deadlineDate = new Date(ev.registration_deadline);
      const isClosed = deadlineDate < now;

      return {
        ...ev,
        registered_count: registered,
        available_seats: available,
        is_full: isFull,
        is_closed: isClosed,
        user_is_registered: Boolean(ev.user_is_registered > 0)
      };
    });

    res.json({
      success: true,
      count: events.length,
      events
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve events.' });
  }
});

// ============================================================================
// GET /api/events/categories/summary
// Summary of categories with active event counts
// ============================================================================
router.get('/categories/summary', async (req, res) => {
  try {
    const summary = await db.all(`
      SELECT category, COUNT(*) as count
      FROM EVENTS
      GROUP BY category
    `);

    res.json({
      success: true,
      categories: summary
    });
  } catch (error) {
    console.error('Error fetching categories summary:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
});

// ============================================================================
// GET /api/events/featured
// Hero spotlight events
// ============================================================================
router.get('/featured', async (req, res) => {
  try {
    const featured = await db.all(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM REGISTRATIONS r WHERE r.event_id = e.id AND r.registration_status = 'confirmed') as registered_count
      FROM EVENTS e
      ORDER BY e.start_datetime ASC
      LIMIT 3
    `);

    res.json({
      success: true,
      events: featured
    });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve featured events.' });
  }
});

// ============================================================================
// GET /api/events/:id
// Single event details
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const currentUserId = req.session && req.session.user ? req.session.user.id : null;

    const sql = `
      SELECT 
        e.*,
        u.full_name as organizer_name,
        u.email as organizer_email,
        (SELECT COUNT(*) FROM REGISTRATIONS r WHERE r.event_id = e.id AND r.registration_status = 'confirmed') as registered_count
        ${currentUserId ? `, (SELECT COUNT(*) FROM REGISTRATIONS ur WHERE ur.event_id = e.id AND ur.user_id = ? AND ur.registration_status = 'confirmed') as user_is_registered` : `, 0 as user_is_registered`}
      FROM EVENTS e
      LEFT JOIN USERS u ON e.organizer_id = u.id
      WHERE e.id = ?
    `;

    const params = currentUserId ? [currentUserId, eventId] : [eventId];
    const event = await db.get(sql, params);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registered = Number(event.registered_count || 0);
    const capacity = Number(event.capacity || 0);
    const available = Math.max(0, capacity - registered);
    const isFull = available <= 0;
    const isClosed = new Date(event.registration_deadline) < new Date();

    res.json({
      success: true,
      event: {
        ...event,
        registered_count: registered,
        available_seats: available,
        is_full: isFull,
        is_closed: isClosed,
        user_is_registered: Boolean(event.user_is_registered > 0)
      }
    });

  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve event.' });
  }
});

module.exports = router;

