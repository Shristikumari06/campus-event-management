/**
 * Authentication & Authorization Middleware
 * Enforces session verification and role-based permissions.
 */

// Middleware to ensure a user is logged in
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

// Middleware to ensure the authenticated user has administrator privileges
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in as an administrator.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      code: 'FORBIDDEN'
    });
  }

  next();
}

// Optional middleware to attach current user session to res.locals or request
function attachUser(req, res, next) {
  res.locals.currentUser = req.session ? req.session.user : null;
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  attachUser
};

