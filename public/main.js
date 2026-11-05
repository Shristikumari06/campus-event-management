/**
 * CampusConnect — Shared Global Script (main.js)
 * Manages global authentication state, topbar updates, toast alerts, and modal dialogs.
 */

// Global State
window.CampusConnect = {
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false
};

// ============================================================================
// 1. TOAST NOTIFICATION SYSTEM
// ============================================================================
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type} animate-slide-in`;

  let iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'error') iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
  if (type === 'warning') iconHtml = '<i class="fa-solid fa-bell"></i>';

  toast.innerHTML = `
    <div class="toast-icon">${iconHtml}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', removeToast);
  setTimeout(removeToast, duration);
}

// ============================================================================
// 2. AUTHENTICATION SESSION CHECK & NAV STATE SYNC
// ============================================================================
async function checkAuthSession() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();

    if (data.authenticated && data.user) {
      window.CampusConnect.currentUser = data.user;
      window.CampusConnect.isAuthenticated = true;
      window.CampusConnect.isAdmin = data.user.role === 'admin';
      localStorage.setItem('campusconnect_active_user', JSON.stringify(data.user));
      syncNavigationState(data.user);
      return data.user;
    }
  } catch (err) {
    // Backend offline / file:// protocol
  }

  // Local storage session fallback
  const localUserStr = localStorage.getItem('campusconnect_active_user');
  if (localUserStr) {
    try {
      const localUser = JSON.parse(localUserStr);
      window.CampusConnect.currentUser = localUser;
      window.CampusConnect.isAuthenticated = true;
      window.CampusConnect.isAdmin = localUser.role === 'admin';
      syncNavigationState(localUser);
      return localUser;
    } catch (e) {
      localStorage.removeItem('campusconnect_active_user');
    }
  }

  window.CampusConnect.currentUser = null;
  window.CampusConnect.isAuthenticated = false;
  window.CampusConnect.isAdmin = false;
  syncNavigationState(null);
  return null;
}

// Sync header actions across landing and other pages
function syncNavigationState(user) {
  const headerActions = document.querySelector('.header-actions');

  if (user) {
    fetchRegisteredBadgeCount();
  }

  if (headerActions) {
    if (user) {
      const isAdmin = user.role === 'admin';
      const portalLink = isAdmin ? 'admin.html' : 'dashboard.html';
      const portalLabel = isAdmin ? 'Admin Portal' : 'My Dashboard';

      headerActions.innerHTML = `
        ${!isAdmin ? `
          <a href="my-registrations.html" class="btn-tickets" title="View your registered passes" aria-label="My Passes">
            <i class="fa-solid fa-ticket"></i>
            <span class="tickets-badge" id="registered-badge">0</span>
            <span class="btn-tickets-text">My Passes</span>
          </a>
        ` : ''}

        <a href="${portalLink}" class="btn btn-secondary" style="background: rgba(255,255,255,0.12); color: #fff;">
          <i class="fa-solid ${isAdmin ? 'fa-shield-halved text-pink' : 'fa-gauge-high text-cyan'}"></i>
          <span>${portalLabel}</span>
        </a>

        <div class="user-greeting-pill" style="display: flex; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.06); padding: 0.35rem 0.85rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.12);">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #ff0080, #7928ca); color: #fff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
            ${user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style="font-size: 0.84rem; font-weight: 600; color: #fff;">${user.full_name ? user.full_name.split(' ')[0] : 'Student'}</span>
        </div>

        <button onclick="handleLogout()" class="btn btn-subtle" title="Sign Out" style="padding: 0.5rem 0.9rem;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>

        <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      `;
    } else {
      headerActions.innerHTML = `
        <a href="login.html" class="btn btn-subtle" id="nav-login-btn">
          <i class="fa-solid fa-arrow-right-to-bracket"></i>
          <span>Login</span>
        </a>
        <a href="signup.html" class="btn btn-primary btn-glow" id="nav-register-btn">
          <i class="fa-solid fa-user-plus"></i>
          <span>Create Account</span>
        </a>
        <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      `;
    }

    setupMobileToggle();
  }
}

// Fetch registration count for active student
async function fetchRegisteredBadgeCount() {
  try {
    const res = await fetch('/api/registrations/my', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      const badge = document.getElementById('registered-badge');
      if (badge) badge.textContent = data.count || 0;
      return;
    }
  } catch (err) {
    // Offline mode: calculate from local storage
  }

  const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
  const currentUser = window.CampusConnect.currentUser;
  const userRegs = currentUser
    ? localRegs.filter((r) => r.user_id === currentUser.id || r.student_id === currentUser.student_id)
    : [];
  const badge = document.getElementById('registered-badge');
  if (badge) badge.textContent = userRegs.length;
}

// Global Logout Handler
async function handleLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    // Offline mode
  }
  localStorage.removeItem('campusconnect_active_user');
  showToast('You have been safely logged out.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

// Mobile drawer menu toggle
function setupMobileToggle() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (toggleBtn && drawer) {
    toggleBtn.onclick = () => {
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    };
  }
}

// Global Modal Helpers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}
window.openModal = openModal;

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
window.closeModal = closeModal;

// Run session check on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
  setupMobileToggle();

  // Scroll header styling
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
});

