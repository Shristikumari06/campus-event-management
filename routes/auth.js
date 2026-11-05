/**
 * Authentication Routes
 * Handles signup, login, session validation, logout, and profile management.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// POST /api/auth/signup
// ============================================================================
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const {
      full_name,
      email,
      student_id,
      department,
      study_year,
      password,
      confirm_password,
      terms
    } = req.body;

    // 1. Validation
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your full student name.' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!student_id || student_id.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Student ID / Roll Number.' });
    }

    if (!department || department.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select your academic department.' });
    }

    if (!study_year || study_year.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select your current year of study.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (!terms) {
      return res.status(400).json({ success: false, message: 'You must agree to the campus terms and conditions.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = student_id.trim().toUpperCase();
    const cleanName = full_name.trim();

    // 2. Check for duplicate email
    const existingEmail = await db.get('SELECT id FROM USERS WHERE email = ?', [cleanEmail]);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // 3. Check for duplicate student ID
    const existingStudentId = await db.get('SELECT id FROM USERS WHERE student_id = ?', [cleanStudentId]);
    if (existingStudentId) {
      return res.status(409).json({
        success: false,
        message: 'An account with this Student Roll Number already exists.'
      });
    }

    // 4. Hash password with bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5. Insert new student into database (Always force role to 'student' to prevent privilege escalation)
    const result = await db.run(
      `INSERT INTO USERS (full_name, email, student_id, department, study_year, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, 'student')`,
      [cleanName, cleanEmail, cleanStudentId, department.trim(), study_year.trim(), passwordHash]
    );

    const newUser = {
      id: result.lastID,
      full_name: cleanName,
      email: cleanEmail,
      student_id: cleanStudentId,
      department: department.trim(),
      study_year: study_year.trim(),
      role: 'student'
    };

    // 6. Automatically log in user by saving session
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ success: false, message: 'Failed to initialize session after signup.' });
      }

      req.session.user = newUser;

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to CampusConnect.',
        user: newUser,
        redirectTo: '/dashboard.html'
      });
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'A server error occurred during account creation. Please try again.'
    });
  }
});

// ============================================================================
// POST /api/auth/login
// ============================================================================
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email address and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Fetch user by email (case-insensitive)
    const user = await db.get(
      'SELECT id, full_name, email, student_id, department, study_year, password_hash, role FROM USERS WHERE email = ?',
      [cleanEmail]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    // 2. Compare password hashes
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    // 3. Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error on login:', err);
        return res.status(500).json({ success: false, message: 'Could not log in. Please try again.' });
      }

      // Secure session payload (no password hash)
      req.session.user = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        student_id: user.student_id,
        department: user.department,
        study_year: user.study_year,
        role: user.role
      };

      // Set cookie duration based on remember-me
      if (remember_me) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      }

      const redirectTo = user.role === 'admin' ? '/admin.html' : '/dashboard.html';

      res.json({
        success: true,
        message: `Welcome back, ${user.full_name}!`,
        user: req.session.user,
        redirectTo
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'A server error occurred during login. Please try again.'
    });
  }
});

// ============================================================================
// POST /api/auth/logout
// ============================================================================
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, message: 'Error logging out.' });
      }
      res.clearCookie('campusconnect.sid');
      return res.json({
        success: true,
        message: 'You have been logged out successfully.',
        redirectTo: '/index.html'
      });
    });
  } else {
    res.json({ success: true, message: 'Already logged out.', redirectTo: '/index.html' });
  }
});

// ============================================================================
// GET /api/auth/me
// ============================================================================
router.get('/me', async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({
      authenticated: false,
      user: null
    });
  }

  try {
    // Fetch latest user details from DB in case details were updated
    const user = await db.get(
      'SELECT id, full_name, email, student_id, department, study_year, role, created_at FROM USERS WHERE id = ?',
      [req.session.user.id]
    );

    if (!user) {
      req.session.destroy();
      return res.json({ authenticated: false, user: null });
    }

    res.json({
      authenticated: true,
      user
    });
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ authenticated: false, message: 'Internal server error.' });
  }
});

// ============================================================================
// POST /api/auth/forgot-password
// Safe implementation that does not reveal account existence
// ============================================================================
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid university email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.get('SELECT id, full_name FROM USERS WHERE email = ?', [cleanEmail]);

    // Constant-time like response regardless of whether user exists
    // (Prevents email enumeration attacks)
    res.json({
      success: true,
      message: 'If this email is registered in our university directory, you will receive password reset instructions shortly. (In development mode, contact your administrator at admin@campusconnect.edu).'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request.' });
  }
});

// ============================================================================
// PUT /api/auth/profile
// Protected profile update route
// ============================================================================
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, department, study_year } = req.body;
    const userId = req.session.user.id;

    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Valid full name required.' });
    }

    await db.run(
      'UPDATE USERS SET full_name = ?, department = ?, study_year = ? WHERE id = ?',
      [full_name.trim(), department.trim(), study_year.trim(), userId]
    );

    // Update session
    req.session.user.full_name = full_name.trim();
    req.session.user.department = department.trim();
    req.session.user.study_year = study_year.trim();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: req.session.user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ============================================================================
// PUT /api/auth/change-password
// Protected password change route
// ============================================================================
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password, confirm_new_password } = req.body;
    const userId = req.session.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Please fill in all password fields.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    if (new_password !== confirm_new_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const user = await db.get('SELECT password_hash FROM USERS WHERE id = ?', [userId]);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.run('UPDATE USERS SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

module.exports = router;

