/**
 * Administrator Management Routes
 * Protected endpoints for event CRUD, participant rosters, and campus analytics.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAdmin } = require('../middleware/auth');

// All routes in this router require admin role
router.use(requireAdmin);

// ============================================================================
// GET /api/admin/stats
// Summary metrics for the administrative dashboard
// ============================================================================
router.get('/stats', async (req, res) => {
  try {
    const students = await db.get("SELECT COUNT(*) as count FROM USERS WHERE role = 'student'");
    const totalEvents = await db.get("SELECT COUNT(*) as count FROM EVENTS");
    const registrations = await db.get("SELECT COUNT(*) as count FROM REGISTRATIONS WHERE registration_status = 'confirmed'");
    const upcoming = await db.get("SELECT COUNT(*) as count FROM EVENTS WHERE start_datetime >= datetime('now')");

    // Also get category breakdown
    const categoryBreakdown = await db.all(`
      SELECT category, COUNT(*) as count
      FROM EVENTS
      GROUP BY category
    `);

    res.json({
      success: true,
      stats: {
        total_students: Number(students.count || 0),
        total_events: Number(totalEvents.count || 0),
        total_registrations: Number(registrations.count || 0),
        upcoming_events: Number(upcoming.count || 0)
      },
      category_breakdown: categoryBreakdown
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve administrative statistics.' });
  }
});

// ============================================================================
// POST /api/admin/events
// Create a new campus event
// ============================================================================
router.post('/events', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image_url,
      venue,
      start_datetime,
      end_datetime,
      registration_deadline,
      capacity,
      eligibility
    } = req.body;

    // Validation
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Event title must be at least 3 characters.' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Detailed description required (minimum 10 chars).' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    if (!venue) {
      return res.status(400).json({ success: false, message: 'Event venue/location is required.' });
    }
    if (!start_datetime || !end_datetime || !registration_deadline) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and registration deadline are required.' });
    }
    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be a positive integer.' });
    }

    const defaultImg = image_url && image_url.trim() !== '' 
      ? image_url.trim() 
      : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

    const organizerId = req.session.user.id;
    const eligibilityCriteria = eligibility && eligibility.trim() !== '' ? eligibility.trim() : 'Open to All Students';

    const result = await db.run(
      `INSERT INTO EVENTS (
        title, description, category, image_url, venue, 
        start_datetime, end_datetime, registration_deadline, capacity, eligibility, organizer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        category.trim(),
        defaultImg,
        venue.trim(),
        start_datetime,
        end_datetime,
        registration_deadline,
        capNum,
        eligibilityCriteria,
        organizerId
      ]
    );

    res.status(201).json({
      success: true,
      message: `Event "${title.trim()}" created successfully!`,
      eventId: result.lastID
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

// ============================================================================
// PUT /api/admin/events/:id
// Update an existing campus event
// ============================================================================
router.put('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      title,
      description,
      category,
      image_url,
      venue,
      start_datetime,
      end_datetime,
      registration_deadline,
      capacity,
      eligibility
    } = req.body;

    const existing = await db.get('SELECT id FROM EVENTS WHERE id = ?', [eventId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be a positive number.' });
    }

    const eligibilityCriteria = eligibility && eligibility.trim() !== '' ? eligibility.trim() : 'Open to All Students';

    await db.run(
      `UPDATE EVENTS 
       SET title = ?, description = ?, category = ?, image_url = ?, venue = ?, 
           start_datetime = ?, end_datetime = ?, registration_deadline = ?, capacity = ?, eligibility = ?
       WHERE id = ?`,
      [
        title.trim(),
        description.trim(),
        category.trim(),
        image_url ? image_url.trim() : null,
        venue.trim(),
        start_datetime,
        end_datetime,
        registration_deadline,
        capNum,
        eligibilityCriteria,
        eventId
      ]
    );

    res.json({
      success: true,
      message: `Event "${title.trim()}" updated successfully.`
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
});

// ============================================================================
// DELETE /api/admin/events/:id
// Delete a campus event and its associated registrations
// ============================================================================
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await db.get('SELECT title FROM EVENTS WHERE id = ?', [eventId]);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // CASCADE delete removes associated registrations
    await db.run('DELETE FROM EVENTS WHERE id = ?', [eventId]);

    res.json({
      success: true,
      message: `Event "${event.title}" and its registrations have been deleted.`
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

// ============================================================================
// GET /api/admin/events/:id/participants
// View participant list for a specific event
// ============================================================================
router.get('/events/:id/participants', async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await db.get('SELECT id, title, capacity FROM EVENTS WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const participants = await db.all(`
      SELECT 
        r.id as registration_id,
        r.registration_status,
        r.registered_at,
        u.id as user_id,
        u.full_name,
        u.email,
        u.student_id,
        u.department,
        u.study_year
      FROM REGISTRATIONS r
      JOIN USERS u ON r.user_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registered_at ASC
    `, [eventId]);

    res.json({
      success: true,
      event,
      total_registered: participants.length,
      participants
    });

  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch participant roster.' });
  }
});

// ============================================================================
// GET /api/admin/events/:id/participants/export
// Download participant roster as CSV file
// ============================================================================
router.get('/events/:id/participants/export', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await db.get('SELECT id, title FROM EVENTS WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const participants = await db.all(`
      SELECT 
        r.id as registration_id,
        u.student_id,
        u.full_name,
        u.email,
        u.department,
        u.study_year,
        r.registration_status,
        r.registered_at
      FROM REGISTRATIONS r
      JOIN USERS u ON r.user_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registered_at ASC
    `, [eventId]);

    let csv = 'Ticket/Reg ID,Student Roll ID,Full Name,Email,Department,Study Year,Status,Registered At\n';
    participants.forEach((p) => {
      const row = [
        `"CC-REG-${p.registration_id}"`,
        `"${p.student_id}"`,
        `"${p.full_name.replace(/"/g, '""')}"`,
        `"${p.email}"`,
        `"${p.department.replace(/"/g, '""')}"`,
        `"${p.study_year || 'UG'}"`,
        `"${p.registration_status}"`,
        `"${p.registered_at}"`
      ];
      csv += row.join(',') + '\n';
    });

    const safeFilename = `CampusConnect_Roster_Event_${eventId}_${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Error exporting participants CSV:', error);
    res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
});

// ============================================================================
// PATCH /api/admin/registrations/:id/status
// Update registration status (e.g. marked as 'attended' or 'cancelled')
// ============================================================================
router.patch('/registrations/:id/status', async (req, res) => {
  try {
    const regId = req.params.id;
    const { status } = req.body;

    if (!['confirmed', 'attended', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid registration status.' });
    }

    const reg = await db.get('SELECT id FROM REGISTRATIONS WHERE id = ?', [regId]);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    await db.run('UPDATE REGISTRATIONS SET registration_status = ? WHERE id = ?', [status, regId]);

    res.json({
      success: true,
      message: `Registration #${regId} status changed to "${status}".`
    });

  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ success: false, message: 'Failed to update registration status.' });
  }
});

module.exports = router;

