/**
 * CampusConnect — Express Server Entrypoint
 * Full-Stack Campus Event Management & Registration Portal
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

// Try loading connect-sqlite3 store, fallback to built-in session store if not available
let sessionStore;
try {
  const SQLiteStore = require('connect-sqlite3')(session);
  sessionStore = new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, 'database'),
    table: 'sessions'
  });
} catch (e) {
  sessionStore = undefined;
}

// Initialize database schema
const initDatabase = require('./database/init');

// Route Handlers
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');
const { attachUser } = require('./middleware/auth');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. CORE MIDDLEWARE
// ============================================================================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// ============================================================================
// 2. SECURE SESSION CONFIGURATION
// ============================================================================
const isProduction = process.env.NODE_ENV === 'production';

app.use(
  session({
    store: sessionStore,
    name: 'campusconnect.sid',
    secret: process.env.SESSION_SECRET || 'campusconnect_secure_eval_key_2026_salt',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Mitigate XSS cookie harvesting
      secure: isProduction, // Transmit only over HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // Default 1 day
      sameSite: 'lax'
    }
  })
);

app.use(attachUser);

// ============================================================================
// 3. STATIC FILES
// ============================================================================
app.use(express.static(path.join(__dirname, 'public')));

// Also serve root assets if needed
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// ============================================================================
// 4. API ROUTES
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Server status & healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    session_active: Boolean(req.session && req.session.user),
    user: req.session && req.session.user ? req.session.user.email : null
  });
});

// ============================================================================
// 5. CLIENT-SIDE ROUTING FALLBACKS
// ============================================================================
// Fallback for missing API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// General 404 handler for static pages
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: isProduction ? undefined : err.message
  });
});

// ============================================================================
// 6. SERVER BOOTSTRAP
// ============================================================================
async function startServer() {
  try {
    await initDatabase();

    function tryListen(portToTry) {
      const server = app.listen(portToTry, () => {
        console.log('====================================================');
        console.log(`🎓 CampusConnect Server Live: http://localhost:${portToTry}`);
        console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🛡️  Admin Account: admin@campusconnect.edu / Admin@12345`);
        console.log('====================================================');
      });

      server.on('error', (err) => {
        if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && portToTry === 3000) {
          console.warn(`⚠️ Port 3000 unavailable (${err.code}). Trying fallback port 3001...`);
          tryListen(3001);
        } else {
          console.error('❌ Server listen error:', err);
        }
      });
    }

    tryListen(PORT);
  } catch (error) {
    console.error('❌ Failed to start CampusConnect server:', error);
    process.exit(1);
  }
}

startServer();

