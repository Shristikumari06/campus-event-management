/**
 * Registration Routes
 * Handles event registration, cancellation, student tickets, and capacity checks.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// ============================================================================
// POST /api/registrations
// Register the current user for an event
// Server validates authentication, duplicate entry, deadlines, and seat capacity.
// ============================================================================
router.post('/', requireAuth, async (req, res) => {
  const userId = req.session.user.id;
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ success: false, message: 'Event ID is required.' });
  }

  try {
    // 1. Check if the event exists
    const event = await db.get(
      'SELECT id, title, category, eligibility, capacity, registration_deadline, venue, start_datetime FROM EVENTS WHERE id = ?',
      [event_id]
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // 2. Check if the registration deadline has passed
    const now = new Date();
    const deadline = new Date(event.registration_deadline);
    if (deadline < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration for this event is closed because the deadline has passed.'
      });
    }

    // 3. Check for existing active registration by this user
    const existingRegistration = await db.get(
      'SELECT id, registration_status FROM REGISTRATIONS WHERE user_id = ? AND event_id = ?',
      [userId, event_id]
    );

    if (existingRegistration) {
      if (existingRegistration.registration_status === 'confirmed') {
        return res.status(409).json({
          success: false,
          message: 'You are already registered for this event. Check "My Registrations" for your pass.'
        });
      } else {
        // If it was cancelled previously, we can re-activate if capacity allows
        // (Handled below)
      }
    }

    // 4. Safely check capacity limits
    const regCount = await db.get(
      'SELECT COUNT(*) as count FROM REGISTRATIONS WHERE event_id = ? AND registration_status = "confirmed"',
      [event_id]
    );

    const currentSeatsTaken = Number(regCount.count || 0);
    if (currentSeatsTaken >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this event has reached maximum seating capacity. Registration is full.'
      });
    }

    // 5. Insert or update registration within SQLite transaction
    let registrationId;
    if (existingRegistration && existingRegistration.registration_status === 'cancelled') {
      await db.run(
        `UPDATE REGISTRATIONS 
         SET registration_status = 'confirmed', registered_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [existingRegistration.id]
      );
      registrationId = existingRegistration.id;
    } else {
      const insertResult = await db.run(
        `INSERT INTO REGISTRATIONS (user_id, event_id, registration_status)
         VALUES (?, ?, 'confirmed')`,
        [userId, event_id]
      );
      registrationId = insertResult.lastID;
    }

    // 6. Generate digital ticket pass reference
    const ticketCode = `CC-2026-${event.id}-${registrationId.toString().padStart(4, '0')}`;

    res.status(201).json({
      success: true,
      message: `Registration confirmed for "${event.title}"! Your digital entry pass is ready.`,
      ticket: {
        registration_id: registrationId,
        ticket_code: ticketCode,
        event_id: event.id,
        event_title: event.title,
        category: event.category,
        eligibility: event.eligibility || 'Open to All Students',
        venue: event.venue,
        start_datetime: event.start_datetime,
        student_name: req.session.user.full_name,
        student_id: req.session.user.student_id,
        department: req.session.user.department,
        registered_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Registration processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process event registration. Please try again.'
    });
  }
});

// ============================================================================
// GET /api/registrations/my
// Get all events the logged-in user is registered for
// ============================================================================
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const sql = `
      SELECT 
        r.id as registration_id,
        r.registration_status,
        r.registered_at,
        e.id as event_id,
        e.title,
        e.description,
        e.category,
        e.image_url,
        e.venue,
        e.start_datetime,
        e.end_datetime,
        e.registration_deadline,
        e.eligibility,
        e.capacity
      FROM REGISTRATIONS r
      JOIN EVENTS e ON r.event_id = e.id
      WHERE r.user_id = ? AND r.registration_status = 'confirmed'
      ORDER BY r.registered_at DESC
    `;

    const registrations = await db.all(sql, [userId]);

    const formatted = registrations.map((r) => ({
      ...r,
      ticket_code: `CC-2026-${r.event_id}-${r.registration_id.toString().padStart(4, '0')}`,
      student_name: req.session.user.full_name,
      student_id: req.session.user.student_id,
      department: req.session.user.department
    }));

    res.json({
      success: true,
      count: formatted.length,
      registrations: formatted
    });

  } catch (error) {
    console.error('Error fetching student registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
  }
});

// ============================================================================
// DELETE /api/registrations/:id
// Cancel a registration (releases the reserved seat back to available pool)
// ============================================================================
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const registrationId = req.params.id;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    // Check if registration exists and belongs to current user or requester is admin
    const reg = await db.get(
      'SELECT r.*, e.title as event_title FROM REGISTRATIONS r JOIN EVENTS e ON r.event_id = e.id WHERE r.id = ?',
      [registrationId]
    );

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    if (reg.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this registration.' });
    }

    // Delete or cancel the registration
    await db.run('DELETE FROM REGISTRATIONS WHERE id = ?', [registrationId]);

    res.json({
      success: true,
      message: `Your registration for "${reg.event_title}" has been successfully cancelled and your seat released.`
    });

  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
});

// ============================================================================
// DELETE /api/registrations/by-event/:eventId
// Cancel registration directly by event ID (convenient for UI button toggle)
// ============================================================================
router.delete('/by-event/:eventId', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.session.user.id;

    const reg = await db.get(
      'SELECT r.*, e.title as event_title FROM REGISTRATIONS r JOIN EVENTS e ON r.event_id = e.id WHERE r.event_id = ? AND r.user_id = ?',
      [eventId, userId]
    );

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Active registration for this event not found.' });
    }

    await db.run('DELETE FROM REGISTRATIONS WHERE id = ?', [reg.id]);

    res.json({
      success: true,
      message: `Registration for "${reg.event_title}" cancelled.`
    });
  } catch (error) {
    console.error('Error cancelling registration by event ID:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
});

module.exports = router;

